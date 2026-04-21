import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile.html',
    styleUrl: './profile.css'
})

export class ProfilePage implements OnInit {
    //отображаемые данные пользователя:
    username: string = ''
    student_id: string = ''

    // Бронирования
    Bookings: any[] = [];

    // Состояния
    isLoading: boolean = true;
    errorMessage: string = '';

    constructor (private auth : AuthService, private router: Router){}

    ngOnInit(){
        if (!this.auth.isLogged()){
            this.router.navigate(['/login']);
            return;
        }
        this.loadProfile();
    }

    loadProfile(){
        this.auth.getProfile().subscribe({
            next: (user) => {
                this.username = user.username;
                this.student_id = user.student_id;
            },
            error: () => {
            this.errorMessage = 'Не удалось загрузить профиль';
            }
        })


        this.auth.getBookings().subscribe({
            next: (Bookings) => {
                this.Bookings = Bookings
                this.isLoading = false;
                },
            error: () => {
                this.isLoading = false;
                }
        })
    }


    logout(){
        this.auth.logout();
    }
}