import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ShopProduct } from '../models/shop-product';

@Injectable({ providedIn: 'root' })
export class ShopService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Products come from the Laravel backend, which talks to the configured
  // affiliate provider (mock until an affiliate network account is live).
  getRecommendations(categories: string[], gender: 'all' | 'womens' | 'mens' = 'all'): Observable<ShopProduct[]> {
    let params = new HttpParams().set('gender', gender);
    for (const c of categories) params = params.append('categories[]', c);

    return this.http.get<ShopProduct[]>(`${this.apiUrl}/shop/recommendations`, { params });
  }

  // Product images are fetched through the backend so third-party CORS rules
  // don't block loading them into a try-on slot.
  fetchProductImage(imageUrl: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/shop/image`, {
      params: new HttpParams().set('url', imageUrl),
      responseType: 'blob',
    });
  }
}
