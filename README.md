Web-Dev_Project

Cinema ticket booking

KBTU Ticket

A platform for booking movie tickets

The user can browse the movie catalog, filter by genre and price, choose a session, book specific seats in the hall, and leave reviews for watched movies

Stack

| Part | Technologies |

| Backend |Python 3.12, Django 4.2, Django REST Framework |

| Authentication |JWT via djangorestframework-simplejwt |

| Frontend |Angular 17+ (standalone components) |

| Database |SQLite (for development) |

| CORS |django-cors-headers |

Project Structure

ticketon/ Django project
├── ticketon/ settings, main urls.py
├── movies/ films, genres, halls, sessions, bookings, reviews
└── users_login/ custom user model, authentication

src/ Angular project
└── src/app/
├── interceptors/ automatic JWT injection into requests
├── services/ HTTP services
└── pages/
├── home-page/ movie catalog
├── movie-details-page/ movie details, seat selection
├── login-page/ login and registration
└── profile-page/ profile, booking history, reviews

Run
Backend
cd ticketon
pip install django djangorestframework djangorestframework-simplejwt django-cors-headers
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

Server runs at http://127.0.0.1:8000

Frontend
cd src
npm install
ng serve

Application opens at http://localhost:4200

Data Models

User — custom user model. Login via student_id (unique KBTU student ID) instead of default username.
Genre — movie genre. Simple name field.
Movie — film. Contains title, description, duration, price, age rating, poster URL, and genre.
Hall — cinema hall. Stores number of rows and seats per row — used to generate seat layout.
Session — specific screening: which movie, which hall, what time, and price.
Booking — user booking for a session. Seats are stored as a string in format "1-1,1-2,2-5" (row-column). The is_active field allows cancellation without deleting records.
Review — user review for a movie. Available only to users who have at least one booking for that movie.

Frontend Pages

| /movies | HomePage | Catalog with genre filtering, title search, and price sorting |

| /movies/:id | MovieDetailsPage | Movie details, session selection, hall seat map, booking |

| /login | LoginPage | Login and registration form (toggle button) |

| /profile | ProfilePage | User data, booking history, review form |

Authentication

JWT is used. After login, the frontend receives two tokens and stores them in localStorage:

access — valid for 30 minutes, sent in every request via Authorization: Bearer <token>
refresh — valid for 7 days, used to obtain a new access token

The token is automatically added via authInterceptor — an interceptor that runs on every HTTP request in the application.
On logout, the refresh token is invalidated on the server using a token blacklist mechanism.

Notes
Genre filtering is server-side (new API request). Search by title and price sorting are client-side (no request).
Booking uses transaction.atomic + select_for_update — protection against two users booking the same seat simultaneously.
The student_id field cannot be changed after registration — it is read_only in UserSerializer.
To populate the database with test data, use Django Admin: http://127.0.0.1:8000/admin/

Group members
Anatoliy Kim 24B031848
Oleg Ukhov 24B032091
Insar Batyrgeldy 24B031690
