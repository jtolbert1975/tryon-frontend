import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { TryOnService, TryOnJob } from '../../services/tryon.service';
import { AuthService } from '../../services/auth.service';
import { ImageProcessorService } from '../../services/image-processor.service';


@Component({
  selector: 'app-tryon',
  standalone: true,
  imports: [],
  templateUrl: './tryon.component.html',
  styleUrl: './tryon.component.scss',
})
export class TryOnComponent {
  private tryOnService = inject(TryOnService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private imageProcessor = inject(ImageProcessorService);

  userImage: File | null = null;
  clothingImage: File | null = null;
  userImagePreview = signal<string | null>(null);
  clothingImagePreview = signal<string | null>(null);

  job = signal<TryOnJob | null>(null);
  error = signal<string | null>(null);
  submitting = signal<boolean>(false);
  processingUser = signal<boolean>(false);
  processingClothing = signal<boolean>(false);
  generationsRemaining = signal<number | null>(null);
  quotaExceeded = signal<boolean>(false);

  private pollSub?: Subscription;

  // tier options for the upgrade prompt (mirrors config/tiers.php)
tiers = [
  { name: 'Basic', price: '$1.99', generations: 10, id: 'basic' },
  { name: 'Pro',   price: '$2.99', generations: 20, id: 'pro' },
];
  

  async onUserImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    this.error.set(null);
    this.processingUser.set(true);
    try {
      const processed = await this.imageProcessor.process(file);
      this.userImage = processed;
      this.userImagePreview.set(URL.createObjectURL(processed));
    } catch {
      this.error.set('Could not process that image. Try a different photo.');
    } finally {
      this.processingUser.set(false);
    }
  }
  
  async onClothingImageSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    this.error.set(null);
    this.processingClothing.set(true);
    try {
      const processed = await this.imageProcessor.process(file);
      this.clothingImage = processed;
      this.clothingImagePreview.set(URL.createObjectURL(processed));
    } catch {
      this.error.set('Could not process that image. Try a different photo.');
    } finally {
      this.processingClothing.set(false);
    }
  }

  submit(): void {
    if (!this.userImage || !this.clothingImage) {
      this.error.set('Please select both a person image and a clothing image.');
      return;
    }
    this.error.set(null);
    this.submitting.set(true);
    this.job.set(null);

    this.tryOnService.create(this.userImage, this.clothingImage).subscribe({
      next: (job) => {
        this.job.set(job);
        this.submitting.set(false);
        if (typeof job.generations_remaining === 'number') {
          this.generationsRemaining.set(job.generations_remaining);
        }
        this.startPolling(job.id);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err?.status === 429) {
          this.error.set(err.error?.message ?? "You've reached your monthly generation limit.");
          // optionally set a flag to show an upgrade prompt later
          this.quotaExceeded.set(true);
        } else {
          this.error.set(err?.error?.message ?? 'Failed to start try-on.');
        }
      },
    });
  }

  private startPolling(id: number): void {
    this.pollSub?.unsubscribe();
    // poll every 3s, keep going while pending/processing
    this.pollSub = interval(3000)
      .pipe(
        switchMap(() => this.tryOnService.getStatus(id)),
        takeWhile(
          (job) => job.status === 'pending' || job.status === 'processing',
          true // emit the final (completed/failed) value too
        )
      )
      .subscribe({
        next: (job) => this.job.set(job),
        error: (err) =>
          this.error.set(err?.error?.message ?? 'Lost connection while polling.'),
      });
  }

  reset(): void {
    this.pollSub?.unsubscribe();
    this.job.set(null);
    this.userImage = null;
    this.clothingImage = null;
    this.userImagePreview.set(null);
    this.clothingImagePreview.set(null);
    this.error.set(null);
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        // even if the server call fails, clear locally and leave
        this.auth.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }

  /* download(): void {
    const url = this.job()?.image_url;
    if (url) {
      window.open(url, '_blank');
    }
  } */

  async download(): Promise<void> {
    const url = this.job()?.image_url;
    if (!url) return;
  
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
  
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `adattamento-result-${this.job()!.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      URL.revokeObjectURL(blobUrl); // clean up
    } catch {
      this.error.set('Could not download the image.');
    }
  }

  selectUpgrade(tierId: string): void {
    // Placeholder until Stripe is wired up
    this.error.set(null);
    console.log('Upgrade selected:', tierId);
    // Later: kick off Stripe checkout for this tier
    alert(`Upgrade to ${tierId} — payment coming soon!`);
  }

  dismissUpgrade(): void {
    this.quotaExceeded.set(false);
  }
}