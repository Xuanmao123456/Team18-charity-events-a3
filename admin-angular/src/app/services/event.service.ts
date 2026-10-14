import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// TypeScript interfaces (matching database schema)
export interface Event {
  event_id: number;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  address: string;
  city: string;
  ticket_price: number;
  capacity: number;
  goal_amount: number;
  raised_amount: number;
  status: string;
  image_url: string;
  category_id: number;
  org_id: number;
  category_name?: string;
  org_name?: string;
  org_description?: string;
  contact_email?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  registrations?: Registration[];
  registration_stats?: {
    count: number;
    total_tickets: number;
  };
}

export interface Registration {
  registration_id: number;
  event_id: number;
  full_name: string;
  email: string;
  phone?: string;
  ticket_quantity: number;
  registered_at: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
}

export interface WeatherData {
  temperature_c: number;
  weather_code: number;
  weather_label: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = '/api';

  constructor(private http: HttpClient) { }

  // Get all active events for home page
  getEvents(): Observable<{ success: boolean; count: number; data: Event[] }> {
    return this.http.get<{ success: boolean; count: number; data: Event[] }>(`${this.apiUrl}/events`);
  }

  // Get single event details (with registration list)
  getEventById(id: number): Observable<{ success: boolean; data: Event }> {
    return this.http.get<{ success: boolean; data: Event }>(`${this.apiUrl}/events/${id}`);
  }

  // Search events by filters
  searchEvents(params: { date?: string; city?: string; category_id?: number }): Observable<{ success: boolean; count: number; data: Event[] }> {
    let httpParams = new HttpParams();
    if (params.date) httpParams = httpParams.set('date', params.date);
    if (params.city) httpParams = httpParams.set('city', params.city);
    if (params.category_id) httpParams = httpParams.set('category_id', params.category_id);

    return this.http.get<{ success: boolean; count: number; data: Event[] }>(`${this.apiUrl}/events/search`, { params: httpParams });
  }

  // Get all event categories
  getCategories(): Observable<{ success: boolean; data: Category[] }> {
    return this.http.get<{ success: boolean; data: Category[] }>(`${this.apiUrl}/categories`);
  }

  // Submit event registration
  register(data: { event_id: number; full_name: string; email: string; phone?: string; ticket_quantity: number }): Observable<{ success: boolean; message: string; data?: Registration }> {
    return this.http.post<{ success: boolean; message: string; data?: Registration }>(`${this.apiUrl}/registrations`, data);
  }

  // Get weather data for event location
  getWeather(latitude: number, longitude: number): Observable<WeatherData> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());
    return this.http.get<WeatherData>(`${this.apiUrl}/weather`, { params });
  }
}
