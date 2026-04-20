from django.db import models
from django.contrib.auth.models import AbstractUser #встроенная модель юзера(ник + пароль)


class User(AbstractUser):
   student_id = models.CharField(max_length=20, unique=True) #добавляем уникальный StudentID (24.........) для пользователя

   USERNAME_FIELD = 'student_id' #логин идет по айдишке(на будущие постман запросы)
   REQUIRED_FIELDS = ['username'] 

   def __str__(self):
    return self.username
    