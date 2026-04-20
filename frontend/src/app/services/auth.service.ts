import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = '/api';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): Observable<any> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.http.post(`${this.apiUrl}/logout`, { refresh: refreshToken }).pipe(
      tap(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        this.isAuthenticatedSubject.next(false);
      })
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }
}