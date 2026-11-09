import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="site-header">
      <a routerLink="/" class="brand">Adattamento</a>
      <nav>
        <a routerLink="/blog">Blog</a>
        <a routerLink="/login">Log in</a>
        <a routerLink="/" class="cta">Try it free</a>
      </nav>
    </header>
  `,
  styles: [`
    .site-header { display: flex; align-items: center; justify-content: space-between; gap: 1rem;
      max-width: 860px; margin: 0 auto; padding: 1rem; }
    .brand { font-size: 1.3rem; font-weight: 800; color: var(--color-dark); text-decoration: none; }
    nav { display: flex; align-items: center; gap: 1rem; }
    nav a { color: var(--color-dark); text-decoration: none; font-weight: 600; font-size: 0.95rem; }
    nav a.cta { background: var(--color-green); color: var(--color-offwhite); padding: 0.5rem 1rem; border-radius: 8px; }
  `],
})
export class SiteHeaderComponent {}
