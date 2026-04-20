import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  name: string;
  email: string;
  balance: number;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  password?: string;
}

export interface TopUpResponse {
  balance: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly api = '/api/user';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/profile`);
  }

  updateProfile(data: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.api}/profile`, data);
  }

  topUpBalance(amount: number): Observable<TopUpResponse> {
    return this.http.post<TopUpResponse>(`${this.api}/balance/top-up`, { amount });
  }
}
