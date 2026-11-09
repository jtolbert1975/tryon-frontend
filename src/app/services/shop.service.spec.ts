import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ShopService } from './shop.service';
import { environment } from '../../environments/environment';

describe('ShopService', () => {
  let service: ShopService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ShopService);
    http = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('requests recommendations from the backend with gender and categories', () => {
    service.getRecommendations(['top', 'shoes'], 'womens').subscribe();

    const req = http.expectOne(r => r.url === `${environment.apiUrl}/shop/recommendations`);
    expect(req.request.params.get('gender')).toBe('womens');
    expect(req.request.params.getAll('categories[]')).toEqual(['top', 'shoes']);
    req.flush([]);
  });
});
