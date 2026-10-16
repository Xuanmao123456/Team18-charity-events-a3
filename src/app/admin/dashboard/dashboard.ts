import { AdminEvent, AdminEventDetailResponse, AdminService } from '../../services/admin.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { AdminNav } from '../admin-nav/admin-nav';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, AdminNav],
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  loading = true;
  error = '';

  totalEvents = 0;            // Total number of activities
  activeEvents = 0;           // Active activities
  totalRegistrations = 0;     // Total registrations
  totalTickets = 0;           // Total tickets sold
  totalRaised = 0;            // Total funds raised

  upcomingEvents: AdminEvent[] = [];  // Upcoming events

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.loading = true;
    this.error = '';
    this.adminService.getEvents().subscribe({
      next: (res) => {
        const events = res.data || [];
        this.totalEvents = events.length;
        this.activeEvents = events.filter(e => e.status === 'active').length;

        // Sort events by date ascending and take the first 5
        this.upcomingEvents = events
          .filter(e => e.status === 'active')
          .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
          .slice(0, 5);

        // List API doesn't include registration stats, so we need to fetch details for each event (acceptable for a small number of events)
        const detailsRequests = events.map(e => this.adminService.getEventById(e.event_id));
        forkJoin(detailsRequests).subscribe({
          next: (details: AdminEventDetailResponse[]) => {
            details.forEach(d => {
              this.totalRegistrations += Number(d.registration_stats?.registration_count ?? 0);
              this.totalTickets += Number(d.registration_stats?.total_tickets ?? 0);
              this.totalRaised += Number(d.data?.raised_amount || 0);
            });
            this.loading = false;
            this.cdr.detectChanges();   // zoneless: manually trigger change detection
          },
          error: (err) => {
            console.error('Failed to load event stats:', err);
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Failed to load events:', err);
        this.error = err.error?.message || 'Failed to load dashboard data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatMoney(n: string | number): string {
    return '$' + Number(n).toFixed(2);
  }

  formatDate(iso: string): string {
    return iso ? iso.slice(0, 10) : '';
  }
}
