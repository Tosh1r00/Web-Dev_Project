import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Movie, MovieService, SeatMapResponse, Session } from '../../services/movie.service';

@Component({
  selector: 'app-movie-details-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movie-details-page.html',
  styleUrl: './movie-details-page.css',
})
export class MovieDetailsPage implements OnInit, OnDestroy {
  movie: Movie | null = null;
  sessions: Session[] = [];
  selectedSession: Session | null = null;
  seatMap: SeatMapResponse | null = null;
  selectedSeats: string[] = [];

  selectedDate = '';

  isLoadingMovie = false;
  isLoadingSessions = false;
  isLoadingSeats = false;
  isBooking = false;
  errorMessage = '';
  bookingMessage = '';

  private movieId: number | null = null;
  private bookingMessageTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || Number.isNaN(id)) {
      this.errorMessage = 'Некорректный идентификатор фильма.';
      return;
    }
    this.movieId = id;
    this.loadMovie(id);
    this.loadSessions(id);
  }

  ngOnDestroy(): void {
    if (this.bookingMessageTimer) {
      clearTimeout(this.bookingMessageTimer);
    }
  }

  backToMenu(): void {
    this.router.navigate(['/movies']);
  }

  onDateChange(): void {
    if (!this.movieId) {
      return;
    }
    this.selectedSession = null;
    this.seatMap = null;
    this.selectedSeats = [];
    this.clearBookingMessage();
    this.loadSessions(this.movieId);
  }

  selectSession(session: Session): void {
    this.selectedSession = session;
    this.clearBookingMessage();
    this.loadSeats(session.id);
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

  private loadMovie(movieId: number): void {
    this.isLoadingMovie = true;
    this.errorMessage = '';
    this.movieService.getMovie(movieId).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.isLoadingMovie = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoadingMovie = false;
        this.handleApiError(error, 'Не удалось загрузить фильм.');
      },
    });
  }

  private loadSessions(movieId: number): void {
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

  private loadSeats(sessionId: number): void {
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

  private handleApiError(error: HttpErrorResponse, fallbackMessage: string): void {
    if (error.status === 0) {
      this.errorMessage = 'Сервер недоступен. Проверь, что Django запущен.';
      return;
    }
    if (error.status === 400) {
      this.errorMessage = 'Ошибка валидации запроса (400).';
      return;
    }
    if (error.status === 404) {
      this.errorMessage = 'Фильм или сеанс не найден.';
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
}
