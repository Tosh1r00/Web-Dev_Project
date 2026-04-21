import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Адрес нашего бэкенда
  private apiUrl = 'http://127.0.0.1:8000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  // Регистрация
  register(username: string, student_id: string, password: string) {
    return this.http.post(`${this.apiUrl}/register/`, {
      username,
      student_id,
      password
    });
  }

  // Логин
  login(student_id: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login/`, {
      student_id,
      password
    });
  }

  // Сохранить токены в localStorage
  saveTokens(access: string, refresh: string, username:string = '') {
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);
    localStorage.setItem('username', username);
  }

  // Выход
  logout() {
    const refresh = localStorage.getItem('refresh');
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.router.navigate(['']);
    if (refresh) {
      this.http.post(`${this.apiUrl}/logout/`, { refresh }).subscribe();
    }
  }

  // Проверка — залогинен ли пользователь
  isLogged(): boolean {
    return !!localStorage.getItem('access');
  }


  //For profile:
 getProfile() {
  return this.http.get<any>('http://127.0.0.1:8000/api/auth/users/me/');
}

getBookings() {
  return this.http.get<any[]>('http://127.0.0.1:8000/api/auth/users/history/');
}
}