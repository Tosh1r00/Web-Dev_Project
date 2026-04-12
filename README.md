# Web-Dev_Project
Cinema ticket booking

## Project description
Authentication and authorization (/login and /register)

A user registration and login system has been implemented. During registration, the user fills out a form with the fields username, email, password and password confirmation with client validation. To log in, a form with an email and password is used, the data is sent to the server, which returns a pair of JWT tokens (access and refresh).

The received tokens are stored in localStorage, and the HTTP interceptor automatically adds them to the headers of all subsequent requests.

A password recovery button is provided (in the current version there is a stub with an email input). After successful login, the user is redirected to the movie catalog page using Router Guard, which protects private routes.

The navigation bar contains links to the "Movies", "Profile" and "Exit" sections and is hidden on the authorization pages. Error handling includes displaying messages with incorrect credentials (401) and outputting field validation errors (400).

Home page — movie catalog (/movies)

The main page displays a list of films in the form of flashcards with basic information: poster, title, genre, rating and duration.

Filtering and search mechanisms are implemented:

filter by genre via the drop-down list;
delayed name search (debounce) to reduce the number of queries;
date filtering, which allows you to show only current sessions.

If there are no results, a corresponding message is displayed with the option to reset the filters.

Clicking on the movie card opens detailed information, including a list of available sessions (date, time, hall, number of available seats).

Selecting a session opens an interactive diagram of the hall, where:

occupied seats are displayed as unavailable;
available seats are available to choose from;
The user can select or deselect locations.

After selecting the seats, the user can send a booking request, which is saved on the server.

User profile (/profile)

The profile section provides the user's personal information, including name, email, and a visual representation of the avatar in the form of initials.

Main functions:

view active bookings with the possibility of canceling them;
viewing the history of sessions attended;
displaying the current balance and the ability to replenish it;
editing personal data (for example, name).

For active bookings, a cancellation function with confirmation of the action is available. If the browsing history is empty, a corresponding message is displayed.

All operations are accompanied by the processing of loading states and errors, including the display of loading indicators and error messages.

Architecture and API interaction

The application is built using services to work with the server:

AuthService — responsible for authentication and token management;
MovieService — getting movie data;
SessionService — working with sessions;
BookingService — booking management;
UserService — operations with the user's profile.

All network requests are made via HttpClient. Angular mechanisms are used for dynamic data display and interface state management, including two-way data binding and conditional rendering.

## Group members
- Anatoliy Kim 24B031848
- Oleg Ukhov 24B032091
- Insar Batyrgeldy 24B031690
