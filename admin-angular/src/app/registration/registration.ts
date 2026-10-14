import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EventService, Event } from '../services/event.service';

@Component({
  selector: 'app-registration',
  imports: [CommonModule, FormsModule, RouterLink],
  styleUrl: './registration.css',
  templateUrl: './registration.html',
})
export class Registration implements OnInit {
  event: Event | null = null;
  loading = true;
  error = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';

  // Registration form data
  fullName = '';
  email = '';
  phone = '';
  ticketQuantity = 1;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService
  ) { }

  ngOnInit() {
    const eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (!eventId) {
      this.error = 'No event specified.';
      this.loading = false;
      return;
    }
    this.loadEventInfo(eventId);
  }

  loadEventInfo(eventId: number) {
    this.eventService.getEventById(eventId).subscribe({
      next: (result) => {
        this.event = result.data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.error = 'Failed to load event information.';
        this.loading = false;
      }
    });
  }

  handleSubmit() {
    if (!this.event) return;

    this.message = '';
    this.messageType = '';

    const payload = {
      event_id: this.event.event_id,
      full_name: this.fullName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      ticket_quantity: this.ticketQuantity
    };

    this.eventService.register(payload).subscribe({
      next: (result) => {
        this.message = result.message || 'Registration successful!';
        this.messageType = 'success';
        // Reset form after successful registration
        this.fullName = '';
        this.email = '';
        this.phone = '';
        this.ticketQuantity = 1;
        // Redirect back to event detail page after 2.5 seconds
        setTimeout(() => {
          window.location.href = `/event/${this.event?.event_id}`;
        }, 2500);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.message = err.error?.message || 'Network error. Please try again.';
        this.messageType = 'error';
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    return timeStr.slice(0, 5);
  }

  getPriceText(event: Event): string {
    return parseFloat(event.ticket_price.toString()).toFixed(2);
  }
}
