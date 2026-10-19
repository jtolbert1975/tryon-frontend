import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ShopProduct } from '../models/shop-product';

@Injectable({ providedIn: 'root' })
export class ShopService {
  // PLACEHOLDER data. Later: replace this method's body with a real
  // affiliate API call (Amazon PA-API, etc.). The signature stays the same.
  getRecommendations(categories: string[], gender: 'all' | 'womens' | 'mens' = 'all'): Observable<ShopProduct[]> {
    let all = this.placeholderProducts();
  
    // filter by gender: a specific choice shows that gender + unisex items
    if (gender !== 'all') {
      all = all.filter(p => p.gender === gender || p.gender === 'unisex');
    }
  
    // prioritize products matching the filled slot categories, then fill with general
    const matched = all.filter(p => categories.includes(p.category));
    const general = all.filter(p => !categories.includes(p.category));
    return of([...matched, ...general].slice(0, 10));
  }
  
  private placeholderProducts(): ShopProduct[] {
    const mk = (
      id: string, name: string, price: string, category: string,
      gender: 'womens' | 'mens' | 'unisex'
    ): ShopProduct => ({
      id, name, price, category, gender,
      imageUrl: `https://placehold.co/300x400?text=${encodeURIComponent(name)}`,
      affiliateUrl: '#',
    });
  
    return [
      mk('1', 'Classic White Shirt', '$39', 'top', 'unisex'),
      mk('2', 'Linen Blazer', '$89', 'top', 'mens'),
      mk('3', 'Silk Blouse', '$55', 'top', 'womens'),
      mk('4', 'Slim Chinos', '$49', 'bottom', 'mens'),
      mk('5', 'High-Waist Jeans', '$59', 'bottom', 'womens'),
      mk('6', 'Leather Sneakers', '$79', 'shoes', 'unisex'),
      mk('7', 'Suede Loafers', '$99', 'shoes', 'mens'),
      mk('8', 'Ankle Boots', '$89', 'shoes', 'womens'),
      mk('9', 'Minimalist Watch', '$120', 'watch', 'unisex'),
      mk('10', 'Wool Scarf', '$35', 'scarf', 'unisex'),
      mk('11', 'Canvas Tote', '$45', 'bag', 'womens'),
      mk('12', 'Aviator Sunglasses', '$55', 'glasses', 'unisex'),
    ];
  }
}