import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { LoginPage } from './pages/login-page/login-page'; // import LoginPage

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full' },
  { path: 'movies', component: HomePage },
  { path: 'login', component: LoginPage },

  { path: '**', redirectTo: 'movies' }, //все страницы перенаправляют на мувис
];
