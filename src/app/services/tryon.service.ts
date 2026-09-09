import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TryOnJob {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  processing_started_at?: string;
  completed_at?: string;
  image_url?: string;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class TryOnService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // POST the two images as multipart/form-data
  create(userImage: File, clothingImage: File): Observable<TryOnJob> {
    const formData = new FormData();
    formData.append('user_image', userImage);
    formData.append('clothing_image', clothingImage);
    return this.http.post<TryOnJob>(`${this.apiUrl}/tryon`, formData);
  }

  // GET the status of a job
  getStatus(id: number): Observable<TryOnJob> {
    return this.http.get<TryOnJob>(`${this.apiUrl}/tryon/${id}`);
  }
}