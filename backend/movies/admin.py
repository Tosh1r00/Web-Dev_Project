from django.contrib import admin
from .models import Genre, Movie, Hall, Session, Booking

admin.site.register(Genre)
admin.site.register(Movie)
admin.site.register(Hall)
admin.site.register(Session)
admin.site.register(Booking)