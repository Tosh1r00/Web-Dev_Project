from rest_framework import serializers
from .models import User

#создаем нового пользователя
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True) #не возвращаем пароль, только принимаем

    class Meta:
        model = User
        fields = ['username' , 'student_id' , 'password'] #поля сериализации

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            student_id=validated_data['student_id'],
            password=validated_data['password'],
    )
        return user 
        
#для авторизованных пользователей просто принимаем вводные
class LoginSerializer(serializers.Serializer):
    student_id = serializers.CharField() #поменяли логин ник на логин айди
    password = serializers.CharField(write_only=True)