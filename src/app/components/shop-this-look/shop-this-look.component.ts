import { Component, inject, input, signal, OnInit, output } from '@angular/core';
import { ShopService } from '../../services/shop.service';
import { ShopProduct } from '../../models/shop-product';

@Component({
  selector: 'app-shop-this-look',
  standalone: true,
  imports: [],
  templateUrl: './shop-this-look.component.html',
  styleUrl: './shop-this-look.component.scss',
})
export class ShopThisLookComponent implements OnInit {
  private shopService = inject(ShopService);

  // the garment categories the user filled (drives recommendations)
  categories = input<string[]>([]);
  // whether the user is on a paid tier (controls whether the hide toggle shows)
  canHide = input<boolean>(false);

  products = signal<ShopProduct[]>([]);
  hidden = signal<boolean>(false);

  gender = signal<'all' | 'womens' | 'mens'>('all');
  private readonly GENDER_KEY = 'adattamento_shop_gender';

  private readonly HIDE_KEY = 'adattamento_hide_shop';

  // which product's slot-picker is open (null = none)
pickerFor = signal<ShopProduct | null>(null);

// emit to the parent: load this product image into this slot
tryOnProduct = output<{ product: ShopProduct; slot: string }>();

// the slots a product can go into
readonly slotOptions = [
  { value: 'outfit', label: 'Full Outfit' },
  { value: 'top',    label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'shoes',  label: 'Shoes' },
  { value: 'accessory', label: 'Accessory' },
];



  ngOnInit(): void {
    // restore the user's hide preference
    try {
      this.hidden.set(localStorage.getItem(this.HIDE_KEY) === 'true');
      const savedGender = localStorage.getItem(this.GENDER_KEY) as 'all'|'womens'|'mens' | null;
    if (savedGender) this.gender.set(savedGender);
    } catch { /* localStorage unavailable — show by default */ }

    this.loadProducts();

  }

  private loadProducts(): void {
    this.shopService.getRecommendations(this.categories(), this.gender()).subscribe({
      next: (products) => this.products.set(products),
      error: () => {},
    });
  }

  setGender(g: 'all' | 'womens' | 'mens'): void {
    this.gender.set(g);
    try { localStorage.setItem(this.GENDER_KEY, g); } catch { /* ignore */ }
    this.loadProducts();   // re-fetch with the new filter
  }

  toggleHidden(): void {
    const next = !this.hidden();
    this.hidden.set(next);
    try {
      localStorage.setItem(this.HIDE_KEY, String(next));
    } catch { /* ignore */ }
  }

  openPicker(product: ShopProduct): void {
    this.pickerFor.set(product);
  }
  
  closePicker(): void {
    this.pickerFor.set(null);
  }
  
  // map a product category to its default slot
  defaultSlotFor(product: ShopProduct): string {
    const garmentSlots = ['outfit', 'top', 'bottom', 'shoes'];
    return garmentSlots.includes(product.category) ? product.category : 'accessory';
  }
  
  chooseSlot(product: ShopProduct, slot: string): void {
    this.tryOnProduct.emit({ product, slot });
    this.closePicker();
  }
}