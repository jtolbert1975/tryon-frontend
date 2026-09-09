import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TryonComponent } from './tryon.component';

describe('TryonComponent', () => {
  let component: TryonComponent;
  let fixture: ComponentFixture<TryonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TryonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TryonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
