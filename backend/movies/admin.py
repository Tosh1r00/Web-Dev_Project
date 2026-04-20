from django.contrib import admin
from .models import Genre, Movie, Hall, Session, Booking


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'genre', 'age_limit', 'price', 'duration', 'created')
    list_filter = ('genre', 'age_limit')
    search_fields = ('title',)
    ordering = ('-created',)


@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'rows', 'seats_per_row')
    search_fields = ('name',)


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'movie', 'hall', 'start_time', 'price')
    list_filter = ('hall',)
    search_fields = ('movie__title', 'hall__name')
    ordering = ('start_time',)


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'session', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('user__username', 'session__movie__title')
    ordering = ('-created_at',)