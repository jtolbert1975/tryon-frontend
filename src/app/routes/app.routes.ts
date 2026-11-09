import { Routes } from '@angular/router';

// Pages are lazy-loaded so public pages (blog, landing) don't download the
// try-on code, including the heavy HEIC converter.
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('../pages/landing/landing.component').then(m => m.LandingComponent),
  },
  { path: 'login', loadComponent: () => import('../pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('../pages/register/register.component').then(m => m.RegisterComponent) },
  {
    path: 'forgot-password',
    loadComponent: () => import('../pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('../pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  { path: 'tryon', loadComponent: () => import('../pages/tryon/tryon.component').then(m => m.TryOnComponent) },
  {
    path: 'blog',
    loadComponent: () => import('../pages/blog/blog-index/blog-index.component').then(m => m.BlogIndexComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('../pages/blog/blog-post/blog-post.component').then(m => m.BlogPostComponent),
  },
  ...['affiliate-disclosure', 'privacy', 'terms'].map(page => ({
    path: page,
    data: { page },
    loadComponent: () => import('../pages/legal/legal.component').then(m => m.LegalComponent),
  })),
];
