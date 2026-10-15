import { AdminEvent, AdminService } from '../../services/admin.service';
import { Component, OnInit } from '@angular/core';

import { AdminNav } from '../admin-nav/admin-nav';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Function 2: Activity List Page
@Component({
  selector: 'app-events',
  imports: [CommonModule, RouterLink, AdminNav],
  styleUrl: './events.css',
  templateUrl: './events.html',
})
export class Events implements OnInit {
  events: AdminEvent[] = [];
  loading = true;
  error = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    this.loading = true;
    this.error = '';
    this.adminService.getEvents().subscribe({
      next: (res) => {
        this.events = res.data || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.error = err.error?.message || 'Failed to load events. Is the API server running?';
        this.loading = false;
      }
    });
  }

  // Function 5: Delete Event
  onDelete(event: AdminEvent) {
    if (!confirm(`Are you sure you want to delete "${event.title}"?`)) return;

    this.adminService.deleteEvent(event.id).subscribe({
      next: (res) => {
        this.showMessage(res.message || 'Event deleted successfully.', 'success');
        this.loadEvents();
      },
      error: (err) => {
        // The system's built-in activity deletion will be rejected by the backend, and the prompt returned by the backend will be displayed
        console.error('Delete failed:', err);
        this.showMessage(err.error?.message || 'Failed to delete the event.', 'error');
      }
    });
  }

  private showMessage(text: string, type: 'success' | 'error') {
    this.message = text;
    this.messageType = type;
    // 3 seconds later, automatically disappear
    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 3000);
  }

  formatPrice(price: number): string {
    return '$' + Number(price).toFixed(2);
  }

  isSystemEvent(event: AdminEvent): boolean {
    return event.is_custom === 0;
  }
}