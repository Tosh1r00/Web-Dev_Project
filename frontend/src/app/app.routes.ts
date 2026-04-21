import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { LoginPage } from './pages/login-page/login-page'; // import LoginPage
import { ProfilePage } from './pages/profile-page/profile'; // import ProfilePage
import { MovieDetailsPage } from './pages/movie-details-page/movie-details-page';

export const routes: Routes = [
  { path: '', redirectTo: 'movies', pathMatch: 'full' },
  { path: 'movies', component: HomePage },
  { path: 'movies/:id', component: MovieDetailsPage },
  { path: 'login', component: LoginPage },
  { path: 'profile', component: ProfilePage},
  { path: '**', redirectTo: 'movies' }, //все страницы перенаправляют на мувис
];
