from django.urls import path
from .. import views

urlpatterns = [
    # FBV routers for login-page
    path('register/', views.register),
    path('login/', views.login),
    path('logout/', views.logout),

    #CBV routers for user-page
    path ('users/me/', views.UserView.as_view()),
    path ('users/history/', views.UserHistoryView.as_view()),
]
