import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService, Genre, Movie, Session, SeatMapResponse } from '../../services/movie.service';
import { HttpErrorResponse } from '@angular/common/http';

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
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private movieService: MovieService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadGenres();
    this.fetchMovies();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
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
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.applyClientFilters();
    }, 450);
  }

  onGenreChange(event: Event): void {
    const target = event.target as HTMLSelectElement | null;
    this.selectedGenreId = target?.value ?? '';
    this.fetchMovies();
  }

  onDateChange(): void {
    if (!this.selectedMovie) {
      return;
    }
    this.loadSessions(this.selectedMovie.id);
  }

  onPriceSortChange(): void {
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
    this.bookingMessage = '';
    this.fetchMovies();
  }

  selectMovie(movie: Movie): void {
    this.selectedMovie = movie;
    this.selectedSession = null;
    this.seatMap = null;
    this.selectedSeats = [];
    this.bookingMessage = '';
    this.loadSessions(movie.id);
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
    this.loadSeats(session.id);
  }

  loadSeats(sessionId: number): void {
    this.isLoadingSeats = true;
    this.errorMessage = '';
    this.selectedSeats = [];
    this.bookingMessage = '';
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
    this.bookingMessage = '';
    this.errorMessage = '';
    this.movieService.createBooking(this.selectedSession.id, this.selectedSeats).subscribe({
      next: () => {
        this.isBooking = false;
        this.bookingMessage = 'Бронь отправлена успешно.';
        this.loadSeats(this.selectedSession!.id);
      },
      error: (error: HttpErrorResponse) => {
        this.isBooking = false;
        if (error.status === 401) {
          this.bookingMessage = 'Чтобы забронировать места, нужно войти или зарегистрироваться.';
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
}