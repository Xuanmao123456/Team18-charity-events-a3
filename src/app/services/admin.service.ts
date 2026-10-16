import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============================================================
// 管理端数据模型 —— 字段名与后端实际返回完全一致
// （后端实测：GET /api/events/all 返回 event_id/ticket_price/
//   category_name/org_id/org_name/status/is_custom）
// ============================================================

export interface AdminEvent {
  event_id: number;
  title: string;
  description: string;
  event_date: string;       // "2026-11-20T16:00:00.000Z"
  start_time: string;       // "19:00:00"
  end_time: string;         // "23:59:00"
  location: string;
  address?: string;
  city: string;
  ticket_price: string | number;
  goal_amount?: string | number;
  raised_amount?: string | number;
  status: string;           // 'active' | 'suspended' | 'past'
  image_url?: string;
  is_custom: number;        // 1 = 自定义（可删）, 0 = 系统（不可删）
  category_id: number;
  category_name: string;
  org_id: number;
  org_name: string;
  latitude?: number;
  longitude?: number;
}

export interface AdminCategory {
  category_id: number;
  category_name: string;
  description?: string;
  is_custom: number;
}

export interface AdminRegistration {
  registration_id: number;
  event_id: number;
  full_name: string;
  email: string;
  phone?: string;
  ticket_quantity: number;
  registered_at: string;
  event_title: string;
}

// GET /api/events/:id 的完整响应（registrations 与统计在顶层，不在 data 里）
export interface AdminEventDetailResponse {
  success: boolean;
  data: AdminEvent;
  registrations: AdminRegistration[];
  registration_stats: {
    registration_count: number;
    total_tickets: number;
  };
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

  // 1. 活动列表 —— 管理端用 /events/all 拿全部（含 status / is_custom）
  getEvents(): Observable<AdminApiResponse<AdminEvent[]>> {
    return this.http.get<AdminApiResponse<AdminEvent[]>>(`${this.apiUrl}/events/all`);
  }

  // 2. 活动详情（含注册列表 + 注册统计）
  getEventById(id: number): Observable<AdminEventDetailResponse> {
    return this.http.get<AdminEventDetailResponse>(`${this.apiUrl}/events/${id}`);
  }

  // 3. 分类列表（创建/编辑表单下拉用）
  getCategories(): Observable<AdminApiResponse<AdminCategory[]>> {
    return this.http.get<AdminApiResponse<AdminCategory[]>>(`${this.apiUrl}/categories`);
  }

  // 4. 创建活动（body 按后端 POST /api/events 要求）
  createEvent(payload: object): Observable<AdminApiResponse<AdminEvent>> {
    return this.http.post<AdminApiResponse<AdminEvent>>(`${this.apiUrl}/events`, payload);
  }

  // 5. 更新活动
  updateEvent(id: number, payload: object): Observable<AdminApiResponse<AdminEvent>> {
    return this.http.put<AdminApiResponse<AdminEvent>>(`${this.apiUrl}/events/${id}`, payload);
  }

  // 6. 删除活动
  deleteEvent(id: number): Observable<AdminApiResponse<null>> {
    return this.http.delete<AdminApiResponse<null>>(`${this.apiUrl}/events/${id}`);
  }

  // 7. 某活动的注册用户列表
  getRegistrations(eventId: number): Observable<AdminApiResponse<AdminRegistration[]>> {
    const params = new HttpParams().set('event_id', eventId.toString());
    return this.http.get<AdminApiResponse<AdminRegistration[]>>(`${this.apiUrl}/registrations`, { params });
  }
}
