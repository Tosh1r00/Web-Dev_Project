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
        this.isLoading = false;
        this.username = 'Anatoliy'
        this.student_id = '24B031848'
    }


    logout(){
        this.auth.logout();
    }
}