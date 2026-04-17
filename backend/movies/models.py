from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Genre(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Movie(models.Model):
    title = models.CharField(max_length = 100)
    description = models.TextField()
    rating = models.FloatField()
    duration = models.IntegerField()
    poster = models.ImageField(upload_to = 'images/', blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.title

class Hall(models.Model):
    name = models.CharField(max_length=100)
    rows = models.IntegerField()
    seatsPerRow = models.IntegerField()

    def __str__(self):
        return self.name

class Session(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE)
    startTime = models.DateTimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.movie} - {self.startTime}"

class Booking(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    seats = models.TextField()
    createdAt = models.DateTimeField(auto_now_add=True)
    isActive = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username} - {self.session.movie.title}"