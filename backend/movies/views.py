from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Movie, Genre
from .serializers import MovieSerializer, GenreSerializer

@api_view(['GET'])
def movie_list(request):
    movies = Movie.objects.all()
    genre_id = request.query_params.get('genre')
    if genre_id:
        movies = Movie.objects.filter(genre_id=genre_id)
    serializer = MovieSerializer(movies, many=True)
    return Response(serializer.data)