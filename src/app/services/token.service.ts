import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly KEY = 'tryon_token';
  // localStorage only exists in the browser; prerendering runs in Node.
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.KEY) : null;
  }

  setToken(token: string): void {
    if (this.isBrowser) localStorage.setItem(this.KEY, token);
  }

  clearToken(): void {
    if (this.isBrowser) localStorage.removeItem(this.KEY);
  }

  hasToken(): boolean {
    return this.getToken() !== null;
  }
}
