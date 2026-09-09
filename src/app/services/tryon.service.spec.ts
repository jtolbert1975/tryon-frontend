import { TestBed } from '@angular/core/testing';

import { TryonService } from './tryon.service';

describe('TryonService', () => {
  let service: TryonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TryonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
