import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { GuestJob, GuestService } from '../../services/guest.service';
import { BLOG_POSTS } from '../../data/blog-posts';
import { SiteFooterComponent } from '../../components/site-footer/site-footer.component';
import { ImageProcessorService } from '../../services/image-processor.service';

type GarmentSlot = 'outfit' | 'top' | 'bottom' | 'shoes';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [FormsModule, RouterLink, SiteFooterComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit, OnDestroy {
  private guest = inject(GuestService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private imageProcessor = inject(ImageProcessorService);
  private platformId = inject(PLATFORM_ID);
  private pollSub?: Subscription;
  private token = '';
  latestPosts = [...BLOG_POSTS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  constructor() {
    inject(Title).setTitle('Adattamento: Virtual Try-On for Any Outfit');
    inject(Meta).updateTag({
      name: 'description',
      content: 'Upload a photo and a piece of clothing and see how it looks on you before you buy. Try one outfit free, no sign-up needed.',
    });
  }

  slot: GarmentSlot = 'top';
  personFile: File | null = null;
  garmentFile: File | null = null;
  personPreview = signal<string | null>(null);
  garmentPreview = signal<string | null>(null);

  trialAvailable = signal<boolean>(true);
  processing = signal<boolean>(false);
  job = signal<GuestJob | null>(null);
  error = signal<string | null>(null);

  email = '';
  marketingConsent = false;
  emailSaved = signal<boolean>(false);
  emailError = signal<string | null>(null);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return; // prerender: static shell only

    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/tryon']);
      return;
    }
    this.guest.isAvailable().subscribe({
      next: (res) => this.trialAvailable.set(res.available),
      error: () => {}, // leave the trial enabled; the server enforces the limit
    });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  async onFileChange(event: Event, kind: 'person' | 'garment'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.error.set(null);
    this.processing.set(true);
    try {
      const processed = await this.imageProcessor.process(file);
      const preview = URL.createObjectURL(processed);
      if (kind === 'person') {
        this.personFile = processed;
        this.personPreview.set(preview);
      } else {
        this.garmentFile = processed;
        this.garmentPreview.set(preview);
      }
    } catch {
      this.error.set('We could not read that image. Please try a JPG, PNG or HEIC photo.');
    } finally {
      this.processing.set(false);
    }
  }

  canSubmit(): boolean {
    return !!this.personFile && !!this.garmentFile && !this.processing() && !this.job();
  }

  onSubmit(): void {
    if (!this.personFile || !this.garmentFile) return;

    this.error.set(null);
    const form = new FormData();
    form.append('user_image', this.personFile);
    form.append(`${this.slot}_image`, this.garmentFile);

    this.processing.set(true);
    this.guest.start(form).subscribe({
      next: (job) => {
        this.processing.set(false);
        this.token = job.guest_token ?? '';
        this.job.set(job);
        this.startPolling(job.id);
      },
      error: (err) => {
        this.processing.set(false);
        if (err?.error?.error === 'guest_limit') {
          this.trialAvailable.set(false);
        } else {
          this.error.set(err?.error?.message ?? 'Something went wrong. Please try again.');
        }
      },
    });
  }

  private startPolling(id: number): void {
    this.pollSub?.unsubscribe();
    this.pollSub = interval(3000)
      .pipe(
        switchMap(() => this.guest.poll(id, this.token)),
        takeWhile((j) => j.status === 'pending' || j.status === 'processing', true)
      )
      .subscribe({
        next: (j) => {
          this.job.set(j);
          if (j.status === 'failed') {
            this.error.set(j.error ?? 'We could not generate this look. Please try again.');
            this.job.set(null);
            this.trialAvailable.set(true);
          }
          if (j.status === 'completed') this.trialAvailable.set(false);
        },
        error: () => {
          this.error.set('Lost connection while generating. Please try again.');
          this.job.set(null);
        },
      });
  }

  saveEmail(): void {
    const job = this.job();
    if (!job || !this.email) return;

    this.emailError.set(null);
    this.guest.saveEmail(job.id, this.token, this.email, this.marketingConsent).subscribe({
      next: () => this.emailSaved.set(true),
      error: (err) =>
        this.emailError.set(err?.error?.errors?.email?.[0] ?? err?.error?.message ?? 'Could not save your email.'),
    });
  }
}
