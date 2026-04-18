from django.db import models
from django.contrib.auth.models import AbstractUser #встроенная модель юзера(ник + пароль)


class User(AbstractUser):
    email = models.EmailField(unique=True) #добавляем уникальный имейл для пользователя

    def __str__(self):
        return self.username
    