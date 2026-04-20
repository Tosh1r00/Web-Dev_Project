import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export interface Booking {
  id: number;
  user: number;
  session: number;
  seats: string[];
  created_at: string;
  is_active: boolean;
  status?: string;
  totalPrice?: number;
  movieTitle?: string;
  sessionDate?: string;
  sessionTime?: string;
  hallName?: string;
  posterUrl?: string;
}

@Injectable({providedIn: 'root' })
export class BookingService {
    private api = '/api/bookings';

    constructor(private http: HttpClient) {
    }

    getUserBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(this.api);
    }

    cancelBooking(bookingId: number): Observable<void> {
        return this.http.delete<void>(`${this.api}/${bookingId}`);
    }

}