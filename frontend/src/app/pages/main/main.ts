import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})

export class Main implements OnInit {
  movies: any[] = [];
  filteredMovies: any[] = [];
  searchTitle: string = '';
  loading = false;
  error = '';

  constructor(private movieService: MovieService) {}

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.loading = true;
    this.movieService.getMovies().subscribe({
      next: (data: any) => {
        this.movies = data;
        this.filteredMovies = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Ошибка загрузки';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyFilters() {
    let filtered = [...this.movies];
    if (this.searchTitle) {
      filtered = filtered.filter(m => m.title.toLowerCase().includes(this.searchTitle.toLowerCase()));
    }
    this.filteredMovies = filtered;
  }

  onSearchChange() {
    this.applyFilters();
  }
}
