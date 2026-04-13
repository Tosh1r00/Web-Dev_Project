from django.db import models

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