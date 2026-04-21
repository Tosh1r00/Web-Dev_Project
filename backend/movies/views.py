import re

from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Movie, Genre, Hall, Session, Booking, Review
from .serializers import (
    MovieSerializer,
    GenreSerializer,
    HallSerializer,
    SessionSerializer,
    BookingSerializer,
    ReviewSerializer,
)


SEAT_CODE_RE = re.compile(r'^\d+-\d+$')


def parse_seats(seats_raw):
    if not seats_raw:
        return []
    seats = [seat.strip() for seat in str(seats_raw).split(',') if seat.strip()]
    unique_seats = []
    seen = set()
    for seat in seats:
        if seat not in seen:
            unique_seats.append(seat)
            seen.add(seat)
    return unique_seats


@api_view(['GET', 'POST'])
def movie_list(request):
    if request.method == 'POST':
        serializer = MovieSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    movies = Movie.objects.for_main_page()
    genre_id = request.query_params.get('genre') or request.query_params.get('genre_id')
    if genre_id:
        movies = movies.filter(genre_id=genre_id)
    serializer = MovieSerializer(movies, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET', 'PUT', 'DELETE'])
def movie_detail(request, pk):
    movie = get_object_or_404(Movie, pk=pk)
    if request.method == 'GET':
        serializer = MovieSerializer(movie, context={'request': request})
        return Response(serializer.data)
    if request.method == 'PUT':
        serializer = MovieSerializer(movie, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    movie.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


class GenreListView(APIView):
    def get(self, request):
        genres = Genre.objects.all()
        serializer = GenreSerializer(genres, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GenreSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GenreDetailView(APIView):
    def get(self, request, pk):
        genre = get_object_or_404(Genre, pk=pk)
        serializer = GenreSerializer(genre)
        return Response(serializer.data)

    def put(self, request, pk):
        genre = get_object_or_404(Genre, pk=pk)
        serializer = GenreSerializer(genre, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        genre = get_object_or_404(Genre, pk=pk)
        genre.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SessionListView(APIView):
    def get(self, request):
        sessions = Session.objects.select_related('movie', 'hall').all()
        movie_id = request.query_params.get('movie')
        if movie_id:
            sessions = sessions.filter(movie_id=movie_id)
        date = request.query_params.get('date')
        if date:
            sessions = sessions.filter(start_time__date=date)
        serializer = SessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SessionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class HallListCreateView(APIView):
    def get(self, request):
        halls = Hall.objects.all()
        serializer = HallSerializer(halls, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = HallSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bookings = Booking.objects.filter(user=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    def post(self, request):
        session_id = request.data.get('session')
        session = get_object_or_404(Session.objects.select_related('hall'), pk=session_id)
        hall = session.hall

        seats = parse_seats(request.data.get('seats'))
        if not seats:
            return Response(
                {'seats': ['Выберите хотя бы одно место.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for seat in seats:
            if not SEAT_CODE_RE.match(seat):
                return Response(
                    {'seats': [f'Неверный формат места: {seat}. Ожидается row-col.']},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            row_str, col_str = seat.split('-')
            row = int(row_str)
            col = int(col_str)
            if row < 1 or row > hall.rows or col < 1 or col > hall.seats_per_row:
                return Response(
                    {'seats': [f'Место {seat} вне диапазона зала.']},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        with transaction.atomic():
            active_bookings = Booking.objects.select_for_update().filter(
                session=session,
                is_active=True,
            )
            taken_seats = set()
            for booking in active_bookings:
                taken_seats.update(parse_seats(booking.seats))

            conflict = sorted(set(seats) & taken_seats)
            if conflict:
                return Response(
                    {'seats': [f'Места уже заняты: {", ".join(conflict)}']},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            payload = request.data.copy()
            payload['seats'] = ','.join(seats)
            serializer = BookingSerializer(data=payload)
            if serializer.is_valid():
                serializer.save(user=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SessionSeatsView(APIView):
    def get(self, request, pk):
        session = get_object_or_404(Session, pk=pk)
        hall = session.hall
        taken_seats = []
        bookings = Booking.objects.filter(session=session, is_active=True)
        for booking in bookings:
            if booking.seats:
                taken_seats.extend(parse_seats(booking.seats))
        data = {
            'rows': hall.rows,
            'seats_per_row': hall.seats_per_row,
            'taken_seats': sorted(set(taken_seats)),
            'price': float(session.price),
        }
        return Response(data)
    


class MovieReviewViews(APIView):
    def get(self,request,pk):
        movie = get_object_or_404(Movie, pk = pk)
        reviews = Review.objects.filter(movie=movie).order_by('-created_at') #фильтруем по дате

        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)
    
    # только для авторизованных
    def post(self,request, pk):
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Необходимо авторизоваться'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        movie = get_object_or_404(Movie, pk=pk)

         # Проверяем что пользователь бронировал этот фильм
        has_booking = Booking.objects.filter( user=request.user, session__movie=movie).exists()

        if not has_booking:
            return Response(
                {'error': 'Вы можете оставить отзыв только на забронированный фильм'}, status=status.HTTP_403_FORBIDDEN
            )

        serializer = ReviewSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, movie=movie)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
