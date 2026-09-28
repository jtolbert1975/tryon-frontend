import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  checkout(tier: string): Observable<{ checkout_url: string }> {
    return this.http.post<{ checkout_url: string }>(
      `${this.apiUrl}/subscribe`,
      { tier }
    );
  }

  getCurrentUser(): Observable<{ tier: string; generations_remaining: number }> {
    return this.http.get<{ tier: string; generations_remaining: number }>(
      `${this.apiUrl}/user`
    );
  }
}