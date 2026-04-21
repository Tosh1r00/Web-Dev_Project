from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

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
        user = authenticate( # authenticate ищет юзера в базе по student_id и password
            student_id=serializer.validated_data['student_id'],
            password=serializer.validated_data['password']
        )
        if user:
            refresh = RefreshToken.for_user(user) # Создаём JWT токены для найденного пользователя
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
    
# For profile-page:
# Обработка запросов 
class UserView(APIView):
    # IsAuthenticated — только залогиненные могут обращаться
    permission = [IsAuthenticated]

    def get(self,request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def patch(self,request):
         # partial=True — можно обновить только часть полей
        serializer = UserSerializer (request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# История бронирований текущего пользователя
# GET /api/users/bookings/ — список всех броней юзера

class UserHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        from movies.models import Booking
        from movies.serializers import BookingSerializer

        #Filter only by ID user
        bookings = Booking.objects.filter(user = request.user).order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)