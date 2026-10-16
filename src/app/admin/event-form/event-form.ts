import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminCategory, AdminEvent, AdminService } from '../../services/admin.service';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { AdminNav } from '../admin-nav/admin-nav';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Function 3+Function 4: Create/Edit Activities
// 字段已对齐后端实测接口：POST/PUT /api/events 接受 ticket_price/category_id/org_id
@Component({
  selector: 'app-event-form',
  imports: [CommonModule, FormsModule, RouterLink, AdminNav],
  styleUrl: './event-form.css',
  templateUrl: './event-form.html',
})
export class EventForm implements OnInit {
  isEdit = false;                 // True=edit mode, false=create mode
  eventId: number | null = null;
  loading = false;                // True when loading existing event data in edit mode
  submitting = false;
  error = '';
  message = '';
  messageType: 'success' | 'error' | '' = '';
  registrationsCount = 0;         // Edit page display for admin registration statistics
  totalRaised = 0;

  // Form model —— 字段名与后端 POST/PUT /api/events 请求体一致
  title = '';
  description = '';
  event_date = '';
  start_time = '';
  end_time = '';
  location = '';
  price: number | null = null;
  categoryId: number | null = null;
  orgId: number | null = null;
  image_url = '';
  latitude: number | null = null;
  longitude: number | null = null;

  // 分类下拉数据（GET /api/categories）
  categories: AdminCategory[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadCategories();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.eventId = Number(id);
      this.loadEvent(this.eventId);
    }
  }

  loadCategories() {
    this.adminService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.data || [];
        this.cdr.detectChanges();  // zoneless: manually trigger change detection
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadEvent(id: number) {
    this.loading = true;
    this.adminService.getEventById(id).subscribe({
      next: (res) => {
        const e: AdminEvent = res.data;
        this.title = e.title;
        this.description = e.description;
        this.event_date = e.event_date?.slice(0, 10);        // "2026-11-20T16:00:00.000Z" → "2026-11-20"
        this.start_time = (e.start_time || '').slice(0, 5);  // "06:30:00" → "06:30"
        this.end_time = (e.end_time || '').slice(0, 5);
        this.location = e.location;
        this.price = Number(e.ticket_price);
        this.categoryId = e.category_id;
        this.orgId = e.org_id;
        this.image_url = e.image_url || '';
        this.latitude = e.latitude ?? null;
        this.longitude = e.longitude ?? null;
        this.registrationsCount = res.registration_stats?.registration_count ?? 0;
        this.totalRaised = Number(e.raised_amount || 0);
        this.loading = false;
        this.cdr.detectChanges();  // zoneless: manually trigger change detection
      },
      error: (err) => {
        console.error('Failed to load event:', err);
        this.error = err.error?.message || 'Failed to load event data.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Verification before submission; Return error message, empty means passed
  validate(): string {
    if (!this.title.trim()) return 'Title is required.';
    if (!this.event_date) return 'Event date is required.';
    if (!this.start_time) return 'Start time is required.';
    if (!this.end_time) return 'End time is required.';
    if (this.start_time >= this.end_time) return 'End time must be later than start time.';
    if (!this.location.trim()) return 'Location is required.';
    if (this.price === null || isNaN(Number(this.price)) || Number(this.price) < 0) {
      return 'Price must be a valid non-negative number.';
    }
    if (!this.categoryId) return 'Category is required.';
    if (!this.orgId) return 'Organizer (org_id) is required.';
    return '';
  }

  // Assemble the payload —— 与后端 POST/PUT /api/events 请求体字段一致
  buildPayload() {
    return {
      title: this.title.trim(),
      description: this.description.trim(),
      event_date: this.event_date,
      start_time: this.start_time + ':00',   // "06:30" → "06:30:00"
      end_time: this.end_time + ':00',
      location: this.location.trim(),
      ticket_price: Number(this.price),
      category_id: Number(this.categoryId),
      org_id: Number(this.orgId),
      image_url: this.image_url.trim(),
      latitude: this.latitude ?? undefined,
      longitude: this.longitude ?? undefined
    };
  }

  handleSubmit() {
    this.message = '';
    this.messageType = '';

    const errMsg = this.validate();
    if (errMsg) {
      this.message = errMsg;
      this.messageType = 'error';
      return;
    }

    this.submitting = true;
    const payload = this.buildPayload();

    const request = (this.isEdit && this.eventId)
      ? this.adminService.updateEvent(this.eventId, payload)
      : this.adminService.createEvent(payload);

    request.subscribe({
      next: (res) => {
        this.submitting = false;
        this.message = res.message || (this.isEdit ? 'Event updated successfully.' : 'Event created successfully.');
        this.messageType = 'success';
        this.cdr.detectChanges();  // zoneless: manually trigger change detection
        // Automatically return to the list page after successful saving
        setTimeout(() => this.router.navigate(['/admin/events']), 1200);
      },
      error: (err) => {
        this.submitting = false;
        console.error('Save failed:', err);
        this.message = err.error?.message || 'Save failed. Please try again.';
        this.messageType = 'error';
        this.cdr.detectChanges();
      }
    });
  }
}
