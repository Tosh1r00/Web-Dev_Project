from rest_framework import serializers
from .models import User

#создаем нового пользователя
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only = True) #не возвращаем пароль, только принимаем

    class Meta:
        model = User
        fields = ['username' , 'email' , 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
    )
        return user 
        
#для авторизованных пользователей просто принимаем вводные
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)