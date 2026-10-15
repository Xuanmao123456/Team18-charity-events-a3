import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminEvent {
  id: number;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  price: number;
  category: string;
  image_url: string;
  latitude?: number;
  longitude?: number;
  organizer_name: string;
  organizer_email?: string;
  organizer_phone?: string;
  is_active: number;
  is_custom: number;
  registrations?: AdminRegistration[];
  stats?: { total_registrations: number; total_raised: number };
}

export interface AdminRegistration {
  id: number;
  event_id: number;
  name: string;
  email: string;
  phone: string;
  registration_date: string;
  event_title?: string;
}

export interface AdminApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  // 1. Obtain a list of all activities
  getEvents(): Observable<AdminApiResponse<AdminEvent[]>> {
    return this.http.get<AdminApiResponse<AdminEvent[]>>(`${this.apiUrl}/events`);
  }

  // 2. Obtain details of a specific activity
  getEventById(id: number): Observable<AdminApiResponse<AdminEvent>> {
    return this.http.get<AdminApiResponse<AdminEvent>>(`${this.apiUrl}/events/${id}`);
  }

  // 3. Create a new activity
  createEvent(payload: object): Observable<AdminApiResponse<AdminEvent>> {
    return this.http.post<AdminApiResponse<AdminEvent>>(`${this.apiUrl}/events`, payload);
  }

  // 4. Update an activity
  updateEvent(id: number, payload: object): Observable<AdminApiResponse<AdminEvent>> {
    return this.http.put<AdminApiResponse<AdminEvent>>(`${this.apiUrl}/events/${id}`, payload);
  }

  // 5. Delete an activity
  deleteEvent(id: number): Observable<AdminApiResponse<null>> {
    return this.http.delete<AdminApiResponse<null>>(`${this.apiUrl}/events/${id}`);
  }

  // 6. Obtain a list of users registered for a specific activity
  getRegistrations(eventId: number): Observable<AdminApiResponse<AdminRegistration[]>> {
    const params = new HttpParams().set('event_id', eventId.toString());
    return this.http.get<AdminApiResponse<AdminRegistration[]>>(`${this.apiUrl}/registrations`, { params });
  }
}