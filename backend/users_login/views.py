from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer

# Регистрация - сериалайзером проверяем тру ли данные при вводе
@api_view(['POST']) # проверяем запрос
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(
            {'message': 'Пользователь создан'}, status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Логин
@api_view(['POST']) # проверяем запрос
def login(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            student_id=serializer.validated_data['student_id'],
            password=serializer.validated_data['password']
        )
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token), # основной токен, который используется для аутентификации пользователя при отправке запросов
                'refresh': str(refresh),
            })
        return Response(
            {'error': 'Неверный логин или пароль'}, status=status.HTTP_401_UNAUTHORIZED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Выход пользователя
@api_view(['POST']) # проверяем запрос
def logout(request):
    try:
        refresh_token = request.data['refresh']
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Вы вышли'})
    
    except Exception:
        return Response(
            {'error': 'Неверный токен'}, status=status.HTTP_400_BAD_REQUEST
        )