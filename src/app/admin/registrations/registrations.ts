import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminRegistration, AdminService } from '../../services/admin.service';
import { Component, OnInit } from '@angular/core';

import { AdminNav } from '../admin-nav/admin-nav';
import { CommonModule } from '@angular/common';

// Function 6: View the list of registered users for a certain activity
@Component({
  selector: 'app-registrations',
  imports: [CommonModule, RouterLink, AdminNav],
  styleUrl: './registrations.css',
  templateUrl: './registrations.html',
})
export class Registrations implements OnInit {
  eventId: number | null = null;
  eventTitle = '';
  registrations: AdminRegistration[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.eventId) {
      this.error = 'No event specified.';
      this.loading = false;
      return;
    }
    this.loadRegistrations(this.eventId);
  }

  loadRegistrations(eventId: number) {
    this.adminService.getRegistrations(eventId).subscribe({
      next: (res) => {
        this.registrations = res.data || [];
        this.eventTitle = this.registrations[0]?.event_title || '';
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load registrations:', err);
        this.error = err.error?.message || 'Failed to load registrations.';
        this.loading = false;
      }
    });
  }

  formatDateTime(dateTimeStr: string): string {
    if (!dateTimeStr) return '';
    return new Date(dateTimeStr.replace(' ', 'T')).toLocaleString('en-AU', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
