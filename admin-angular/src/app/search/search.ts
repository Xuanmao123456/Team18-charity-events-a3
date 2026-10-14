import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService, Event, Category } from '../services/event.service';

@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrl: './search.css',
  templateUrl: './search.html',
})
export class Search implements OnInit {
  // Search form filters
  date = '';
  location = '';
  categoryId = '';

  // Component data
  categories: Category[] = [];
  events: Event[] = [];
  loading = true;
  error = false;

  constructor(private eventService: EventService) { }

  ngOnInit() {
    this.loadCategories();
    this.loadAllEvents();
  }

  loadCategories() {
    this.eventService.getCategories().subscribe({
      next: (result) => {
        this.categories = result.data;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  loadAllEvents() {
    this.loading = true;
    this.error = false;
    this.eventService.getEvents().subscribe({
      next: (result) => {
        this.events = result.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  handleSearch() {
    this.loading = true;
    this.error = false;

    const params: { date?: string; city?: string; category_id?: number } = {};
    if (this.date) params.date = this.date;
    if (this.location) params.city = this.location;
    if (this.categoryId) params.category_id = parseInt(this.categoryId);

    this.eventService.searchEvents(params).subscribe({
      next: (result) => {
        this.events = result.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  handleClearFilters() {
    this.date = '';
    this.location = '';
    this.categoryId = '';
    this.loadAllEvents();
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

  alert(msg: string) {
    alert(msg);
  }
}
