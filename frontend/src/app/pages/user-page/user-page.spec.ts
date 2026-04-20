import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserPage } from './user-page';

describe('UserPage', () => {
  let component: UserPage;
  let fixture: ComponentFixture<UserPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPage, RouterTestingModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return initials from full name', () => {
    component.user = { name: 'Amir Amirov', email: '', balance: 0 };
    expect(component.getInitials()).toBe('AA');
  });

  it('should return initials from name', () => {
    component.user = { name: 'Amir', email: '', balance: 0 };
    expect(component.getInitials()).toBe('A');
  });

  it('should filter active bookings', () => {
    component.bookings = [
      {
        id: 1, movieTitle: 'A', sessionDate: '', sessionTime: '', hallName: '', seats: [], totalPrice: 0, status: 'active',
        user: 0,
        session: 0,
        created_at: '',
        is_active: false
      },
      {
        id: 3, movieTitle: 'C', sessionDate: '', sessionTime: '', hallName: '', seats: [], totalPrice: 0, status: 'cancelled',
        user: 0,
        session: 0,
        created_at: '',
        is_active: false
      }
    ];
    expect(component.activeBookings.length).toBe(1);
    expect(component.historyBookings.length).toBe(2);
  });

  it('should sum only attended bookings', () => {
    component.bookings = [
      {
        id: 1, movieTitle: 'A', sessionDate: '', sessionTime: '', hallName: '', seats: [], totalPrice: 10000, status: 'attended',
        user: 0,
        session: 0,
        created_at: '',
        is_active: false
      },
      {
        id: 2, movieTitle: 'B', sessionDate: '', sessionTime: '', hallName: '', seats: [], totalPrice: 5000, status: 'cancelled',
        user: 0,
        session: 0,
        created_at: '',
        is_active: false
      }
    ];
    expect(component.totalSpent).toBe(10000);
  });

  it('should set FormErrors when name is empty', () => {
    component.f = { name: '', email:'a@a.com', pass:'', pass2: '' };
    component.save();
    expect(component.fe['name']).toBeTruthy();
  });

  it('should set FormErrors when passwords do not match', () => {
    component.f = { name: '', email:'a@a.com', pass:'password', pass2: 'different' };
    component.save();
    expect(component.fe['pass2']).toBeTruthy();
  });

  it('should set topUp error for amount below minimum', () => {
    component.topupAmt = '500';
    component.doTopup();
    expect(component.topupErr).toBeTruthy();
  });
});
