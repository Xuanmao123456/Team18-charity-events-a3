import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService, Event } from '../services/event.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  events: Event[] = [];
  loading = true;
  error = false;
  currentSlide = 0;

  constructor(private eventService: EventService, private cdr: ChangeDetectorRef) { }

  // Hero carousel slides
  slides = [
    {
      title: 'Together, We Can Make a Difference',
      subtitle: 'Discover and support charity events across the Gold Coast and Brisbane.',
      bgImage: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&h=600&fit=crop',
      gradient: 'linear-gradient(rgba(212, 165, 165, 0.55), rgba(192, 136, 136, 0.55))'
    },
    {
      title: 'Every Ticket Helps',
      subtitle: 'Join fun runs, gala dinners and silent auctions for causes you care about.',
      bgImage: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1600&h=600&fit=crop',
      gradient: 'linear-gradient(rgba(232, 184, 124, 0.55), rgba(212, 165, 92, 0.55))'
    },
    {
      title: 'Be Part of Something Big',
      subtitle: 'Connect with passionate organisers and caring supporters in your community.',
      bgImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&h=600&fit=crop',
      gradient: 'linear-gradient(rgba(168, 192, 160, 0.55), rgba(139, 168, 136, 0.55))'
    }
  ];

  ngOnInit() {
    this.loadEvents();
    this.startCarousel();
  }

  loadEvents() {
    console.log('loadEvents() called, loading =', this.loading);
    this.loading = true;
    this.error = false;
    console.log('about to call getEvents(), loading =', this.loading);
    this.eventService.getEvents().subscribe({
      next: (result) => {
        console.log('getEvents() success:', result);
        this.events = result.data;
        console.log('events set to:', this.events.length);
        this.loading = false;
        console.log('loading set to:', this.loading);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  startCarousel() {
    setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.slides.length;
      this.cdr.detectChanges();
    }, 5000);
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  formatDate(dateStr: string): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-AU', options);
  }

  getPriceText(event: Event): string {
    return event.ticket_price == 0 ? 'FREE' : '$' + parseFloat(event.ticket_price.toString()).toFixed(2);
  }

  getCategoryClass(categoryName?: string): string {
    if (!categoryName) return 'badge-charity-concert';
    const name = categoryName.toLowerCase();
    if (name.includes('run')) return 'badge-fun-run';
    if (name.includes('gala')) return 'badge-gala-dinner';
    if (name.includes('auction')) return 'badge-silent-auction';
    if (name.includes('concert')) return 'badge-charity-concert';
    if (name.includes('fair')) return 'badge-community-fair';
    return 'badge-charity-concert';
  }
}
