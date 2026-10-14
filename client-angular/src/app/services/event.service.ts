import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// TypeScript 接口定义（跟数据库字段对应）
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

  // 获取首页活动列表（active 状态）
  getEvents(): Observable<{ success: boolean; count: number; data: Event[] }> {
    return this.http.get<{ success: boolean; count: number; data: Event[] }>(`${this.apiUrl}/events`);
  }

  // 获取单个活动详情（含注册列表）
  getEventById(id: number): Observable<{ success: boolean; data: Event }> {
    return this.http.get<{ success: boolean; data: Event }>(`${this.apiUrl}/events/${id}`);
  }

  // 搜索活动
  searchEvents(params: { date?: string; city?: string; category_id?: number }): Observable<{ success: boolean; count: number; data: Event[] }> {
    let httpParams = new HttpParams();
    if (params.date) httpParams = httpParams.set('date', params.date);
    if (params.city) httpParams = httpParams.set('city', params.city);
    if (params.category_id) httpParams = httpParams.set('category_id', params.category_id);

    return this.http.get<{ success: boolean; count: number; data: Event[] }>(`${this.apiUrl}/events/search`, { params: httpParams });
  }

  // 获取所有分类
  getCategories(): Observable<{ success: boolean; data: Category[] }> {
    return this.http.get<{ success: boolean; data: Category[] }>(`${this.apiUrl}/categories`);
  }

  // 提交注册
  register(data: { event_id: number; full_name: string; email: string; phone?: string; ticket_quantity: number }): Observable<{ success: boolean; message: string; data?: Registration }> {
    return this.http.post<{ success: boolean; message: string; data?: Registration }>(`${this.apiUrl}/registrations`, data);
  }

  // 获取天气
  getWeather(latitude: number, longitude: number): Observable<WeatherData> {
    let params = new HttpParams()
      .set('latitude', latitude.toString())
      .set('longitude', longitude.toString());
    return this.http.get<WeatherData>(`${this.apiUrl}/weather`, { params });
  }
}
