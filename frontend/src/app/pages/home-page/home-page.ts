import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService, Genre, Movie, Session, SeatMapResponse } from '../../services/movie.service';
import { HttpErrorResponse } from '@angular/common/http';

//Для маршрутизации и проврерки пользователя на вход
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit, OnDestroy {
  movies: Movie[] = [];
  visibleMovies: Movie[] = [];
  genres: Genre[] = [];
  sessions: Session[] = [];
  selectedMovie: Movie | null = null;
  selectedSession: Session | null = null;
  seatMap: SeatMapResponse | null = null;
  selectedSeats: string[] = [];

  searchTerm = '';
  selectedGenreId = '';
  selectedDate = '';
  priceSort: '' | 'asc' | 'desc' = '';

  isLoadingMovies = false;
  isLoadingSessions = false;
  isLoadingSeats = false;
  isBooking = false;
  errorMessage = '';
  bookingMessage = '';

  //переменные на вход
  isLoggedIn: boolean = false;
  currentUsername: string = '';


  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private bookingMessageTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private movieService: MovieService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    this.fetchMovies();

    //работа с кнопкой
    this.isLoggedIn = this.auth.isLogged();
    this.currentUsername = localStorage.getItem('username') || 'Профиль';
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    if (this.bookingMessageTimer) {
      clearTimeout(this.bookingMessageTimer);
    }
  }

  fetchMovies(): void {
    this.isLoadingMovies = true;
    this.errorMessage = '';
    this.movieService
      .getMovies(this.selectedGenreId ? { genreId: Number(this.selectedGenreId) } : undefined)
      .subscribe({
        next: (movies) => {
          this.movies = movies;
          this.applyClientFilters();
          this.isLoadingMovies = false;
          this.cdr.detectChanges();
        },
        error: (error: HttpErrorResponse) => {
          this.isLoadingMovies = false;
          this.handleApiError(error, 'Не удалось загрузить список фильмов.');
          this.cdr.detectChanges();
        },
      });
  }

  loadGenres(): void {
    this.movieService.getGenres().subscribe({
      next: (genres) => {
        this.genres = genres;
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.handleApiError(error, 'Не удалось загрузить жанры.');
        this.cdr.detectChanges();
      },
    });
  }

  onSearchChange(): void {
    this.clearBookingMessage();
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.applyClientFilters();
    }, 450);
  }

  onGenreChange(event: Event): void {
    this.clearBookingMessage();
    const target = event.target as HTMLSelectElement | null;
    this.selectedGenreId = target?.value ?? '';
    this.fetchMovies();
  }

  onPriceSortChange(): void {
    this.clearBookingMessage();
    this.applyClientFilters();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedGenreId = '';
    this.selectedDate = '';
    this.priceSort = '';
    this.selectedMovie = null;
    this.selectedSession = null;
    this.sessions = [];
    this.seatMap = null;
    this.selectedSeats = [];
    this.clearBookingMessage();
    this.fetchMovies();
  }

  selectMovie(movie: Movie): void {
    this.clearBookingMessage();
    this.router.navigate(['/movies', movie.id]);
  }

  loadSessions(movieId: number): void {
    this.isLoadingSessions = true;
    this.errorMessage = '';
    this.movieService.getSessions(movieId, this.selectedDate || undefined).subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.isLoadingSessions = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingSessions = false;
        this.handleApiError(error, 'Не удалось загрузить сеансы.');
      },
    });
  }

  selectSession(session: Session): void {
    this.selectedSession = session;
    this.clearBookingMessage();
    this.loadSeats(session.id);
  }

  loadSeats(sessionId: number): void {
    this.isLoadingSeats = true;
    this.errorMessage = '';
    this.selectedSeats = [];
    this.clearBookingMessage();
    this.movieService.getSessionSeats(sessionId).subscribe({
      next: (seatMap) => {
        this.seatMap = seatMap;
        this.isLoadingSeats = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingSeats = false;
        this.handleApiError(error, 'Не удалось загрузить схему зала.');
      },
    });
  }

  toggleSeat(seatCode: string): void {
    if (this.isSeatTaken(seatCode)) {
      return;
    }
    if (this.selectedSeats.includes(seatCode)) {
      this.selectedSeats = this.selectedSeats.filter((seat) => seat !== seatCode);
      return;
    }
    this.selectedSeats = [...this.selectedSeats, seatCode];
  }

  bookSelectedSeats(): void {
    if (!this.selectedSession || this.selectedSeats.length === 0) {
      return;
    }
    this.isBooking = true;
    this.clearBookingMessage();
    this.errorMessage = '';
    this.movieService.createBooking(this.selectedSession.id, this.selectedSeats).subscribe({
      next: () => {
        this.isBooking = false;
        this.bookingMessage = 'Бронь отправлена успешно.';
        this.startBookingMessageTimer();
        this.loadSeats(this.selectedSession!.id);
      },
      error: (error: HttpErrorResponse) => {
        this.isBooking = false;
        if (error.status === 401) {
          this.bookingMessage = 'Чтобы забронировать места, нужно войти или зарегистрироваться.';
          this.startBookingMessageTimer();
          return;
        }
        this.handleApiError(error, 'Не удалось отправить бронь.');
      },
    });
  }

  getSeatRows(): number[] {
    if (!this.seatMap) {
      return [];
    }
    return Array.from({ length: this.seatMap.rows }, (_, index) => index + 1);
  }

  getSeatColumns(): number[] {
    if (!this.seatMap) {
      return [];
    }
    return Array.from({ length: this.seatMap.seats_per_row }, (_, index) => index + 1);
  }

  seatCode(row: number, col: number): string {
    return `${row}-${col}`;
  }

  isSeatTaken(seatCode: string): boolean {
    return this.seatMap?.taken_seats.includes(seatCode) ?? false;
  }

  applyClientFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();
    const filteredMovies = this.movies.filter((movie) => {
      const isTitleMatch = search ? movie.title.toLowerCase().includes(search) : true;
      return isTitleMatch;
    });

    if (this.priceSort) {
      filteredMovies.sort((a, b) => {
        const priceA = Number(a.price);
        const priceB = Number(b.price);
        return this.priceSort === 'asc' ? priceA - priceB : priceB - priceA;
      });
    }

    this.visibleMovies = filteredMovies;
  }

  private handleApiError(error: HttpErrorResponse, fallbackMessage: string): void {
    if (error.status === 0) {
      this.errorMessage = 'Сервер недоступен. Проверь, что Django запущен.';
      return;
    }
    if (error.status === 400) {
      this.errorMessage = 'Ошибка валидации запроса (400).';
      return;
    }
    this.errorMessage = fallbackMessage;
  }

  private clearBookingMessage(): void {
    this.bookingMessage = '';
    if (this.bookingMessageTimer) {
      clearTimeout(this.bookingMessageTimer);
      this.bookingMessageTimer = null;
    }
  }

  private startBookingMessageTimer(): void {
    if (this.bookingMessageTimer) {
      clearTimeout(this.bookingMessageTimer);
    }
    this.bookingMessageTimer = setTimeout(() => {
      this.bookingMessage = '';
      this.bookingMessageTimer = null;
    }, 3500);
  }


  //навигация кнопки
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}