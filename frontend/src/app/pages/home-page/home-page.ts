import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface DateChip {
  id: string;
  day: string;
  weekday: string;
  active: boolean;
}

export interface HomeEventCard {
  id: number;
  title: string;
  posterUrl: string;
  age: string;
  dateLine: string;
  venue?: string;
  priceBase: string;
}

export interface HomeEventSection {
  id: string;
  title: string;
  items: HomeEventCard[];
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  dateOptions: DateChip[] = [
    { id: '2026-04-19', day: '19', weekday: 'вс', active: true },
    { id: '2026-04-20', day: '20', weekday: 'пн', active: false },
    { id: '2026-04-21', day: '21', weekday: 'вт', active: false },
    { id: '2026-04-22', day: '22', weekday: 'ср', active: false },
    { id: '2026-04-23', day: '23', weekday: 'чт', active: false },
    { id: '2026-04-24', day: '24', weekday: 'пт', active: false },
    { id: '2026-04-25', day: '25', weekday: 'сб', active: false },
    { id: '2026-04-26', day: '26', weekday: 'вс', active: false },
    { id: '2026-04-27', day: '27', weekday: 'пн', active: false },
    { id: '2026-04-28', day: '28', weekday: 'вт', active: false },
    { id: '2026-04-29', day: '29', weekday: 'ср', active: false },
    { id: '2026-04-30', day: '30', weekday: 'чт', active: false },
    { id: '2026-05-01', day: '1', weekday: 'пт', active: false },
    { id: '2026-05-02', day: '2', weekday: 'сб', active: false },
    { id: '2026-05-03', day: '3', weekday: 'вс', active: false },
    { id: '2026-05-04', day: '4', weekday: 'пн', active: false },
    { id: '2026-05-05', day: '5', weekday: 'вт', active: false },
  ];

  eventSections: HomeEventSection[] = [
    {
      id: 'top',
      title: 'Топ-событий',
      items: [
        {
          id: 1001,
          title: 'Сергей Лазарев в Астане',
          posterUrl: '',
          age: '16+',
          dateLine: '14 сентября, 20:00',
          priceBase: 'От 30 000 ₸',
        },
        {
          id: 1002,
          title: 'Cirque du Soleil с шоу OVO в Астане',
          posterUrl: '',
          age: '0+',
          dateLine: '4 июня, 19:30',
          priceBase: 'От 25 000 ₸',
        },
        {
          id: 1003,
          title: 'PGL Astana 2026',
          posterUrl: '',
          age: '0+',
          dateLine: '15 мая, 08:00',
          venue: 'г. Астана, пр. Туран, 57',
          priceBase: 'От 44 000 ₸',
        },
        {
          id: 1004,
          title: 'Enrique Iglesias в Астане',
          posterUrl: '',
          age: '6+',
          dateLine: '3 сентября, 20:00',
          priceBase: 'От 45 000 ₸',
        },
        {
          id: 1005,
          title: 'Шәмші Қалдаяқовтың ән кеші Астана қаласында',
          posterUrl: '',
          age: '0+',
          dateLine: '19 апреля, 15:00',
          priceBase: 'От 5 000 ₸',
        },
      ],
    },
    {
      id: 'week',
      title: 'Хиты недели',
      items: [
        {
          id: 2001,
          title: 'Астана - Аят (Футзал)',
          posterUrl: '',
          age: '0+',
          dateLine: '19 апреля, 20:30',
          priceBase: 'От 1 000 ₸',
        },
        {
          id: 2002,
          title: 'Мастер-класс по Мобилографии в Астане',
          posterUrl: '',
          age: '10+',
          dateLine: '25 апреля, 11:00',
          priceBase: 'От 20 000 ₸',
        },
        {
          id: 2003,
          title: '«Винни-пух и все-все-все» в Астане',
          posterUrl: '',
          age: '0+',
          dateLine: '17 апреля, 10:00',
          priceBase: 'От 1 000 ₸',
        },
        {
          id: 2004,
          title: 'ГАЛА - КОНЦЕРТ II «NOMAD AWARDS»',
          posterUrl: '',
          age: '0+',
          dateLine: '19 апреля, 18:00',
          priceBase: 'От 2 500 ₸',
        },
      ],
    },
    {
      id: 'popular',
      title: 'Популярное',
      items: [
        {
          id: 3001,
          title: 'БАУЫРЖАН ИСАЕВ: «Аяулым»',
          posterUrl: '',
          age: '0+',
          dateLine: '1 мая, 19:00',
          priceBase: 'От 5 000 ₸',
        },
        {
          id: 3002,
          title: 'Мари Краймбрери в Астане',
          posterUrl: '',
          age: '0+',
          dateLine: '17 мая, 19:00',
          priceBase: 'От 30 000 ₸',
        },
        {
          id: 3003,
          title: 'Юбилейный концерт «До’Star»',
          posterUrl: '',
          age: '5+',
          dateLine: '22 апреля, 19:00',
          priceBase: 'От 2 500 ₸',
        },
        {
          id: 3004,
          title: 'ЭЙНШТЕЙН И МАРГАРИТА',
          posterUrl: '',
          age: '16+',
          dateLine: '17 мая, 19:00',
          priceBase: 'От 25 000 ₸',
        },
      ],
    },
    {
      id: 'recommended',
      title: 'Рекомендуемое',
      items: [
        {
          id: 4001,
          title: 'Жұбаныш Жексенұлы Астана қаласында!',
          posterUrl: '',
          age: '0+',
          dateLine: '27 апреля, 19:30',
          priceBase: 'От 6 000 ₸',
        },
        {
          id: 4002,
          title: 'Mayot в Астане',
          posterUrl: '',
          age: '18+',
          dateLine: '17 мая, 20:00',
          venue: 'г. Астана, ул. Хусейн бен Талал, 25',
          priceBase: 'От 17 500 ₸',
        },
        {
          id: 4003,
          title: 'Ludovico Einaudi в Астане',
          posterUrl: '',
          age: '0+',
          dateLine: '3 мая, 19:30',
          priceBase: 'От 7 000 ₸',
        },
        {
          id: 4004,
          title: 'Mad Mozart в Астане',
          posterUrl: '',
          age: '6+',
          dateLine: '24 мая, 20:00',
          priceBase: 'От 10 000 ₸',
        },
      ],
    },
    {
      id: 'cinema',
      title: 'Киноафиша',
      items: [
        {
          id: 5001,
          title: 'Вот это драма! (2026)',
          posterUrl: '',
          age: '18+',
          dateLine: '17 апреля, 00:10',
          priceBase: 'От 30 000 ₸',
        },
        {
          id: 5002,
          title: 'Операция «Панда». Дикая миссия (2026)',
          posterUrl: '',
          age: '12+',
          dateLine: '19 апреля, 18:10',
          priceBase: 'От 30 000 ₸',
        },
        {
          id: 5003,
          title: 'Мошенники (2026)',
          posterUrl: '',
          age: '18+',
          dateLine: '18 апреля, 21:40',
          venue: 'Евразия Синема',
          priceBase: 'От 1 400 ₸',
        },
        {
          id: 5004,
          title: 'Нормал (2026)',
          posterUrl: '',
          age: '18+',
          dateLine: '19 апреля, 14:40',
          venue: 'Chaplin Khan Shatyr',
          priceBase: 'От 1 800 ₸',
        },
      ],
    },
    {
      id: 'all',
      title: 'Все события',
      items: [
        {
          id: 6001,
          title: 'ZHANULKA в Астане',
          posterUrl: '',
          age: '16+',
          dateLine: '11 апреля, 16:05',
          venue: 'OLIGARD BAR, Кабанбай Батыра 32',
          priceBase: 'От 16 000 ₸',
        },
        {
          id: 6002,
          title: 'Супер Марио: Галактическое кино (2026)',
          posterUrl: '',
          age: '0+',
          dateLine: '13 апреля, 10:20',
          priceBase: 'От 1 200 ₸',
        },
        {
          id: 6003,
          title: 'Красная маска (2026)',
          posterUrl: '',
          age: '6+',
          dateLine: '13 апреля, 10:20',
          priceBase: 'От 1 200 ₸',
        },
        {
          id: 6004,
          title: '«Ван Гог. Ожившие полотна» в Lumiere-Hall',
          posterUrl: '',
          age: '0+',
          dateLine: '13 апреля, 11:00',
          priceBase: 'От 4 000 ₸',
        },
        {
          id: 6005,
          title: 'Гауһартас',
          posterUrl: '',
          age: '0+',
          dateLine: '14 апреля, 19:00',
          venue: 'Астана',
          priceBase: 'От 1 500 ₸',
        },
      ],
    },
  ];
}