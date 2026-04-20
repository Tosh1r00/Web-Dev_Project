import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; //для инпут [(ngModel)]
import { Router } from '@angular/router'; //для маршрутизации после AUTH/REG
import { CommonModule } from '@angular/common'; //для ngIf and NgFor 

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  //Переменные которые вешаю на инпуты:
  student_id: string = '';
  password: string = '';
  username: string = '';

  //Логика которую я буду использовать для переключения между AUTH/REG:
  isLogin: boolean = true;

  //Для формы с ошибками
  errorMessage: String = ''

  // for dependency-injection + сервис подключаем
  constructor (private router: Router){}

  //Для переключение Reg <-> Auth
  changeMode(){
    this.isLogin = !this.isLogin;
    this.errorMessage = ''
  }

  // Отправка формы - REG/AUTH
  onSubmit() {
    if (this.isLogin) {
      this.login();
    } else {
      this.register();
    }
  }

  login() {
    console.log('Логин:', this.student_id, this.password);
  }

  register() {
    console.log('Регистрация:', this.username, this.student_id, this.password);
  }
}
