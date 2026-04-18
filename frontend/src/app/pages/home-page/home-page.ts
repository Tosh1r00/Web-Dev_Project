import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  movies = [
    {title: 'test1', genre: {name: 'ggg'}},
    {title: 'test2', genre: {name: 'hhh'}},
    {title: 'test3', genre: {name: 'fff'}},
  ]
}
