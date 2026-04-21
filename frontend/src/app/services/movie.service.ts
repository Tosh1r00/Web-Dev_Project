import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  duration: number;
  price: string;
  age_limit: string;
  poster: string | null;
  poster_url?: string | null;
  created: string;
  genre: Genre | null;
}

export interface Session {
  id: number;
  movie: number;
  hall: number;
  start_time: string;
  price: string;
}

export interface SeatMapResponse {
  rows: number;
  seats_per_row: number;
  taken_seats: string[];
  price: number;
}

interface MovieQuery {
  genreId?: number;
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly apiBaseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getMovies(query?: MovieQuery): Observable<Movie[]> {
    let params = new HttpParams();
    if (query?.genreId) {
      params = params.set('genre', query.genreId.toString());
    }
    return this.http.get<Movie[]>(`${this.apiBaseUrl}/movies/`, { params });
  }

  getMovie(movieId: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiBaseUrl}/movies/${movieId}/`);
  }

  getGenres(): Observable<Genre[]> {
    return this.http.get<Genre[]>(`${this.apiBaseUrl}/genres/`);
  }

  getSessions(movieId: number, date?: string): Observable<Session[]> {
    let params = new HttpParams().set('movie', movieId.toString());
    if (date) {
      params = params.set('date', date);
    }
    return this.http.get<Session[]>(`${this.apiBaseUrl}/sessions/`, { params });
  }

  getSessionSeats(sessionId: number): Observable<SeatMapResponse> {
    return this.http.get<SeatMapResponse>(`${this.apiBaseUrl}/sessions/${sessionId}/seats/`);
  }

  createBooking(sessionId: number, seats: string[]): Observable<unknown> {
    return this.http.post(`${this.apiBaseUrl}/bookings/`, {
      session: sessionId,
      seats: seats.join(','),
    });
  }
}
