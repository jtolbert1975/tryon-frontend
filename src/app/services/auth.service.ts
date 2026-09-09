import { Injectable, inject, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

interface AuthResponse {
  user: { id: number; name: string; email: string };
  token: string;
  token_type: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private apiUrl = environment.apiUrl;

  isLoggedIn = signal<boolean>(this.tokenService.hasToken());

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register` , payload).pipe(
      tap((res) => {
        this.tokenService.setToken(res.token);
        this.isLoggedIn.set(true);
      })
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login` , payload).pipe(
      tap((res) => {
        this.tokenService.setToken(res.token);
        this.isLoggedIn.set(true);
      })
    )
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.tokenService.clearToken();
        this.isLoggedIn.set(false);
      })
    );
  }

  clearSession(): void {
    this.tokenService.clearToken();
    this.isLoggedIn.set(false);
  }


}
