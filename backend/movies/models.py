from django.conf import settings
from django.db import models


class MovieQuerySet(models.QuerySet):
    """Запросы для списка фильмов на главной (кастомный QuerySet)."""

    def for_main_page(self):
        return self.select_related('genre').order_by('-created')


class MovieManager(models.Manager.from_queryset(MovieQuerySet)):
    """Кастомный менеджер: через него удобно получать данные для главной."""

    pass


class Genre(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Movie(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    rating = models.FloatField()
    duration = models.IntegerField()
    poster = models.ImageField(upload_to='images/', blank=True, null=True)
    created = models.DateTimeField(auto_now_add=True)
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True)

    objects = MovieManager()

    def __str__(self):
        return self.title


class Hall(models.Model):
    name = models.CharField(max_length=100)
    rows = models.IntegerField()
    seats_per_row = models.IntegerField()

    def __str__(self):
        return self.name


class Session(models.Model):
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE)
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f'{self.movie} - {self.start_time}'


class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    session = models.ForeignKey(Session, on_delete=models.CASCADE)
    seats = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.user.username} - {self.session.movie.title}'