import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService, Event, Registration, WeatherData } from '../services/event.service';

@Component({
  selector: 'app-event-detail',
  imports: [CommonModule, RouterLink],
  styleUrl: './event-detail.css',
  templateUrl: './event-detail.html',
})
export class EventDetail implements OnInit {
  event: Event | null = null;
  registrations: Registration[] = [];
  regStats = { count: 0, total_tickets: 0 };
  weather: WeatherData | null = null;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (!eventId) {
      this.error = true;
      this.loading = false;
      return;
    }
    this.loadEventDetail(eventId);
  }

  loadEventDetail(eventId: number) {
    this.loading = true;
    this.error = false;

    this.eventService.getEventById(eventId).subscribe({
      next: (result) => {
        this.event = result.data;
        this.registrations = result.data.registrations || [];
        this.regStats = result.data.registration_stats || { count: 0, total_tickets: 0 };

        // 如果有经纬度，加载天气
        if (this.event?.latitude && this.event?.longitude) {
          this.loadWeather(this.event.latitude, this.event.longitude);
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.error = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadWeather(lat: number, lon: number) {
    this.eventService.getWeather(lat, lon).subscribe({
      next: (data) => {
        this.weather = data;
      },
      error: (err) => {
        console.warn('Weather unavailable:', err);
      }
    });
  }

  formatDate(dateStr: string): string {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-AU', options);
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return 'N/A';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${suffix}`;
  }

  formatMoney(n: number): string {
    return n.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  getPriceText(event: Event): string {
    return event.ticket_price == 0 ? 'FREE' : '$' + parseFloat(event.ticket_price.toString()).toFixed(2);
  }

  getGoalPercent(event: Event): number {
    const goal = parseFloat(event.goal_amount.toString()) || 0;
    const raised = parseFloat(event.raised_amount.toString()) || 0;
    return goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;
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

  getRaisedAmount(event: Event): number {
    return parseFloat(event.raised_amount.toString());
  }

  getGoalAmount(event: Event): number {
    return parseFloat(event.goal_amount.toString());
  }
}
