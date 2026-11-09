import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GuestJob {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  guest_token?: string;
  image_url?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class GuestService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  isAvailable(): Observable<{ available: boolean }> {
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/guest/status`);
  }

  start(formData: FormData): Observable<GuestJob> {
    return this.http.post<GuestJob>(`${this.apiUrl}/guest/tryon`, formData);
  }

  poll(id: number, token: string): Observable<GuestJob> {
    return this.http.get<GuestJob>(`${this.apiUrl}/guest/tryon/${id}`, {
      params: new HttpParams().set('token', token),
    });
  }

  saveEmail(id: number, token: string, email: string, marketingConsent: boolean): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/guest/tryon/${id}/email`, {
      token,
      email,
      marketing_consent: marketingConsent,
    });
  }
}
