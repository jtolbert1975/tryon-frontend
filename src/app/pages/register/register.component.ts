import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  passwordConfirmation = '';
  error = signal<string | null>(null);
  loading = signal<boolean>(false);

  onSubmit(): void {
    this.error.set(null);
    this.loading.set(true);

    this.auth
      .register({
        name: this.name,
        email: this.email,
        password: this.password,
        password_confirmation: this.passwordConfirmation,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigate(['/tryon']);
        },
        error: (err) => {
          this.loading.set(false);
          // Laravel validation errors come back under err.error.errors
          const firstError =
            err?.error?.errors && Object.values(err.error.errors)[0];
          this.error.set(
            (Array.isArray(firstError) ? firstError[0] : null) ??
              err?.error?.message ??
              'Registration failed.'
          );
        },
      });
  }
}