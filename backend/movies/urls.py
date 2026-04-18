from django.urls import path
from . import views

urlpatterns = [
    path('movies/', views.movie_list),
    path('movies/<int:pk>/', views.movie_detail),
    path('genres/', views.GenreListView.as_view()),
    path('genres/<int:pk>/', views.GenreDetailView.as_view()),
    path('halls/', views.HallListCreateView.as_view()),
    path('sessions/', views.SessionListView.as_view()),
    path('bookings/', views.BookingListCreateView.as_view()),
    path('sessions/<int:pk>/seats/', views.SessionSeatsView.as_view()),
    path('register/', views.register),
]
