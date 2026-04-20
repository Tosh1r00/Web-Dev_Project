from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Movie, Genre, Hall, Session, Booking
from .serializers import (
    MovieSerializer,
    GenreSerializer,
    HallSerializer,
    SessionSerializer,
    BookingSerializer,
)


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
        serializer = BookingSerializer(data=request.data)
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
                taken_seats.extend(
                    [s.strip() for s in booking.seats.split(',') if s.strip()]
                )
        data = {
            'rows': hall.rows,
            'seats_per_row': hall.seats_per_row,
            'taken_seats': taken_seats,
            'price': float(session.price),
        }
        return Response(data)