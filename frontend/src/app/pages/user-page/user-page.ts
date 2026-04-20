import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService, UserProfile, UpdateProfileRequest } from '../../services/user.service';
import { BookingService, Booking } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css',
})
export class UserPage implements OnInit, OnDestroy {

  user: UserProfile = { name: '', email: '', balance: 0 };
  bookings: Booking[] = [];
  tab: 'active' | 'history' | 'edit' = 'active';

  loading = false;         error = '';
  bookingsLoading = false; bookingsError = '';
  saving = false;          saveOk = false; saveErr = '';
  cancelId: number | null = null;
  topupLoading = false;    topupErr = '';

  showCancel = false; pending: Booking | null = null;
  showTopup  = false; topupAmt = '5000';
  toast = '';
  private toastTimer: any;

  f  = { name: '', email: '', pass: '', pass2: '' };
  fe: Record<string, string> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private userSvc: UserService,
    private bookingSvc: BookingService,
    private authSvc: AuthService,
    private router: Router,
  ) {}

  ngOnInit()    { this.loadData(); }
  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); clearTimeout(this.toastTimer); }

  get activeBookings():  Booking[] { return this.bookings.filter(b => b.status === 'active'); }
  get historyBookings(): Booking[] { return this.bookings.filter(b => b.status !== 'active'); }
  get totalSpent(): number { return this.bookings.filter(b => b.status === 'attended').reduce((sum, b) => sum + (b.totalPrice || 0), 0); }

  getInitials(): string {
    return this.user.name.trim().split(' ').filter(Boolean).map(w => w[0].toUpperCase()).join('').substring(0, 2);
  }

  loadData(): void {
    this.loading = true; this.error = '';
    this.userSvc.getProfile().pipe(takeUntil(this.destroy$)).subscribe({
      next: p => { this.user = p; this.f.name = p.name; this.f.email = p.email; this.loading = false; this.loadBookings(); },
      error: e => { this.error = e.status === 401 ? 'Сессия истекла.' : 'Ошибка загрузки профиля.'; this.loading = false; },
    });
  }

  private loadBookings(): void {
    this.bookingsLoading = true; this.bookingsError = '';
    this.bookingSvc.getUserBookings().pipe(takeUntil(this.destroy$)).subscribe({
      next: d => { this.bookings = d; this.bookingsLoading = false; },
      error: () => { this.bookingsError = 'Ошибка загрузки билетов.'; this.bookingsLoading = false; },
    });
  }

  askCancel(b: Booking)   { this.pending = b; this.showCancel = true; }
  doCancel(): void {
    if (!this.pending) return;
    const b = this.pending;
    this.showCancel = false; this.cancelId = b.id;
    this.bookingSvc.cancelBooking(b.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => { b.status = 'cancelled'; this.cancelId = null; this.pending = null; this.showToast('Бронирование отменено'); },
      error: () => { this.cancelId = null; this.pending = null; this.showToast('Ошибка при отмене.'); },
    });
  }

  doTopup(): void {
    const amt = parseInt(this.topupAmt, 10);
    if (!amt || amt < 1000) { this.topupErr = 'Минимум 1 000 ₸'; return; }
    this.topupLoading = true; this.topupErr = '';
    this.userSvc.topUpBalance(amt).pipe(takeUntil(this.destroy$)).subscribe({
      next: r => { this.user.balance = r.balance; this.showTopup = false; this.topupLoading = false; this.showToast(`Пополнено на ${amt.toLocaleString()} ₸`); },
      error: () => { this.topupErr = 'Ошибка при пополнении.'; this.topupLoading = false; },
    });
  }

  save(): void {
    this.fe = {}; this.saveOk = false; this.saveErr = '';
    if (!this.f.name.trim())          this.fe['name']  = 'Введите имя';
    if (!this.f.email.includes('@'))  this.fe['email'] = 'Некорректный email';
    if (this.f.pass && this.f.pass.length < 6) this.fe['pass'] = 'Минимум 6 символов';
    if (this.f.pass !== this.f.pass2) this.fe['pass2'] = 'Пароли не совпадают';
    if (Object.keys(this.fe).length)  return;
    this.saving = true;
    const p: UpdateProfileRequest = { name: this.f.name.trim(), email: this.f.email.trim(), ...(this.f.pass && { password: this.f.pass }) };
    this.userSvc.updateProfile(p).pipe(takeUntil(this.destroy$)).subscribe({
      next: u => { this.user.name = u.name; this.user.email = u.email; this.f.pass = ''; this.f.pass2 = ''; this.saving = false; this.saveOk = true; setTimeout(() => this.saveOk = false, 4000); },
      error: e => { this.saveErr = e.status === 400 && e.error?.errors ? Object.values<string>(e.error.errors).join(', ') : 'Ошибка при сохранении.'; this.saving = false; },
    });
  }

  logout() { this.authSvc.logout(); this.router.navigate(['/login']); }

  private showToast(msg: string) {
    this.toast = msg;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast = '', 3000);
  }
}