# Web-Dev_Project
Cinema ticket booking

# KBTU Ticket

Платформа для бронирования билетов в кино

Пользователь может просматривать каталог фильмов, фильтровать по жанру и цене, выбирать сеанс, бронировать конкретные места в зале и оставлять отзывы на просмотренные фильмы

## Стек

|       Часть       |                         Технологии                          |
|       Backend     |Python 3.12, Django 4.2, Django REST Framework               |
|       Авторизация |JWT через `djangorestframework-simplejwt`                    |
|       Frontend    |Angular 17+ (standalone components)                          |
|      База данных  |SQLite (для разработки)                                      |
|       CORS        |`django-cors-headers`                                        |
 
## Структура проекта

ticketon/                Django проект
├── ticketon/            настройки, главный urls.py
├── movies/              фильмы, жанры, залы, сеансы, брони, отзывы
└── users_login/         кастомная модель пользователя, авторизация

src/                     Angular проект
└── src/app/
    ├── interceptors/    автоматическое добавление JWT в запросы
    ├── services/        HTTP-сервисы
    └── pages/
        ├── home-page/           каталог фильмов
        ├── movie-details-page/  детали фильма, выбор мест
        ├── login-page/          вход и регистрация
        └── profile-page/        профиль, история броней, отзывы

## Запуск

### Backend

```bash
cd ticketon
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
Сервер поднимается на `http://127.0.0.1:8000`

### Frontend

```bash
cd src
npm install
ng serve
```
Приложение открывается на `http://localhost:4200`

## API endpoints

### Авторизация

| Метод| URL                        | Описание                                 |
| POST | `/api/auth/register/`      | Регистрация                              |
| POST | `/api/auth/login/`         | Вход, возвращает access + refresh токены |
| POST | `/api/auth/logout/`        | Выход, инвалидирует refresh токен        |
| GET  | `/api/auth/users/me/`      | Данные текущего пользователя             |
| PATCH| `/api/auth/users/me/`      | Обновить имя пользователя                |
| GET  | `/api/auth/users/history/` | История бронирований                     |
| POST | `/api/token/`              | Получить JWT токены напрямую (Postman)   |
| POST | `/api/token/refresh/`      | Обновить access токен                    |

### Фильмы и каталог

| Метод | URL | Описание |
| GET | `/api/movies/` | Список фильмов. Параметр: `?genre=<id>` |
| POST | `/api/movies/` | Добавить фильм |
| GET | `/api/movies/<id>/` | Один фильм |
| PUT | `/api/movies/<id>/` | Обновить фильм |
| DELETE | `/api/movies/<id>/` | Удалить фильм |
| GET | `/api/genres/` | Список жанров |
| POST | `/api/genres/` | Добавить жанр |
| GET | `/api/genres/<id>/` | Один жанр |
| PUT | `/api/genres/<id>/` | Обновить жанр |
| DELETE | `/api/genres/<id>/` | Удалить жанр |

### Залы, сеансы и брони

| Метод | URL | Описание |
| GET | `/api/halls/` | Список залов |
| POST | `/api/halls/` | Добавить зал |
| GET | `/api/sessions/` | Список сеансов. Параметры: `?movie=<id>&date=<YYYY-MM-DD>` |
| POST | `/api/sessions/` | Добавить сеанс |
| GET | `/api/sessions/<id>/seats/` | Схема зала с занятыми местами |
| GET | `/api/bookings/` | Брони текущего пользователя `🔒` |
| POST | `/api/bookings/` | Забронировать места `🔒` |

### Отзывы

| Метод | URL | Описание |
| GET | `/api/movies/<id>/reviews/` | Отзывы к фильму |
| POST | `/api/movies/<id>/reviews/` | Оставить отзыв `🔒` (только если есть бронь) |

`🔒` — требует JWT токен в заголовке `Authorization: Bearer <token>`


## Модели данных

**User** — кастомная модель пользователя. Логин по `student_id` (уникальный ID студента КБТУ) вместо стандартного username.
**Genre** — жанр фильма. Просто название.
**Movie** — фильм. Содержит название, описание, длительность, цену, возрастной рейтинг, ссылку на постер и жанр.
**Hall** — зал кинотеатра. Хранит количество рядов и мест в ряду — из этого строится схема мест.
**Session** — конкретный сеанс: какой фильм, в каком зале, в какое время, по какой цене.
**Booking** — бронь пользователя на сеанс. Места хранятся строкой в формате `"1-1,1-2,2-5"` (ряд-колонка). Поле `is_active` позволяет отменять брони без удаления из базы.
**Review** — отзыв пользователя на фильм. Доступен только тем у кого есть хотя бы одна бронь на этот фильм.

## Страницы фронтенда

| URL | Компонент | Описание |
| `/movies` | HomePage | Каталог с фильтрацией по жанру, поиском по названию и сортировкой по цене |
| `/movies/:id` | MovieDetailsPage | Детали фильма, выбор сеанса, схема зала, бронирование |
| `/login` | LoginPage | Форма входа и регистрации (переключаются кнопкой) |
| `/profile` | ProfilePage | Данные пользователя, история броней, форма отзыва |

## Авторизация

Используется JWT. После логина фронт получает два токена и сохраняет их в `localStorage`:
- `access` — живёт 30 минут, передаётся в каждом запросе через заголовок `Authorization: Bearer <token>`
- `refresh` — живёт 7 дней, используется для получения нового access токена
Токен добавляется автоматически через `authInterceptor` — перехватчик срабатывает на каждый HTTP-запрос в приложении.
При выходе refresh токен инвалидируется на сервере через механизм token blacklist.

## Заметки

- Фильтрация по жанру — серверная (новый запрос к API). Поиск по названию и сортировка по цене — клиентская (без запроса).
- При бронировании используется `transaction.atomic` + `select_for_update` — защита от ситуации когда два пользователя одновременно пытаются занять одно место.
- Поле `student_id` нельзя изменить после регистрации — оно `read_only` в `UserSerializer`.
- Для заполнения базы данных тестовыми данными используй Django Admin: `http://127.0.0.1:8000/admin/`

## Group members
- Anatoliy Kim 24B031848
- Oleg Ukhov 24B032091
- Insar Batyrgeldy 24B031690
