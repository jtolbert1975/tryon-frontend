import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: '../login/login.component.scss',
})
export class ResetPasswordComponent {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private token = this.route.snapshot.queryParamMap.get('token') ?? '';
  email = this.route.snapshot.queryParamMap.get('email') ?? '';
  password = '';
  passwordConfirmation = '';

  hasLink = !!this.token && !!this.email;
  message = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  onSubmit(): void {
    this.error.set(null);

    if (this.password.length < 8) {
      this.error.set('Password must be at least 8 characters.');
      return;
    }
    if (this.password !== this.passwordConfirmation) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.auth
      .resetPassword({
        token: this.token,
        email: this.email,
        password: this.password,
        password_confirmation: this.passwordConfirmation,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.message.set(res.message);
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(
            err?.status === 429
              ? 'Too many attempts. Please wait a minute and try again.'
              : err?.error?.message ?? 'Could not reset your password. Please request a new link.'
          );
        },
      });
  }
}
