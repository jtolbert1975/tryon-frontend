import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: '../login/login.component.scss',
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);

  email = '';
  message = signal<string | null>(null);
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  onSubmit(): void {
    this.error.set(null);
    this.message.set(null);
    this.loading.set(true);

    this.auth.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.message.set(res.message);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.status === 429
            ? 'Too many attempts. Please wait a minute and try again.'
            : err?.error?.message ?? 'Something went wrong. Please try again.'
        );
      },
    });
  }
}
