import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopThisLookComponent } from './shop-this-look.component';

describe('ShopThisLookComponent', () => {
  let component: ShopThisLookComponent;
  let fixture: ComponentFixture<ShopThisLookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopThisLookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShopThisLookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
