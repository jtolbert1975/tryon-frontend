import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <nav>
        <a routerLink="/">Try it free</a>
        <a routerLink="/blog">Blog</a>
        <a routerLink="/affiliate-disclosure">Affiliate disclosure</a>
        <a routerLink="/privacy">Privacy</a>
        <a routerLink="/terms">Terms</a>
      </nav>
      <p>&copy; 2026 Adattamento. Some links on this site may be affiliate links; see our disclosure.</p>
    </footer>
  `,
  styles: [`
    .site-footer { text-align: center; padding: 2rem 1rem; font-size: 0.85rem; color: #6b5f50; }
    nav { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin-bottom: 0.75rem; }
    a { color: var(--color-green); text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
    p { margin: 0; }
  `],
})
export class SiteFooterComponent {}
