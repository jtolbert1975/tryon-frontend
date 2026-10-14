import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, interval, switchMap, takeWhile } from 'rxjs';
import { TryOnService, TryOnJob } from '../../services/tryon.service';
import { AuthService } from '../../services/auth.service';
import { ImageProcessorService } from '../../services/image-processor.service';
import { SubscriptionService } from '../../services/subscription.service';
import { ActivatedRoute } from '@angular/router';
import { HelpModalComponent } from '../../components/help-modal/help-modal.component';
import { UpgradeModalComponent } from '../../components/upgrade-modal/upgrade-modal.component';
import { AccessoryItem } from '../../models/accessory';
import { AccessoriesComponent } from '../../components/accessories/accessories.component';

@Component({
  selector: 'app-tryon',
  standalone: true,
  imports: [HelpModalComponent, UpgradeModalComponent, AccessoriesComponent],
  templateUrl: './tryon.component.html',
  styleUrl: './tryon.component.scss',
})
export class TryOnComponent implements OnInit {
  private tryOnService = inject(TryOnService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private imageProcessor = inject(ImageProcessorService);
  private subscriptionService = inject(SubscriptionService);
  private route = inject(ActivatedRoute);

  userImage: File | null = null;
  outfitImage: File | null = null;
  topImage: File | null = null;
  bottomImage: File | null = null;
  shoesImage: File | null = null;
  userImagePreview = signal<string | null>(null);
  outfitImagePreview = signal<string | null>(null);
  topImagePreview = signal<string | null>(null);
  bottomImagePreview = signal<string | null>(null);
  shoesImagePreview = signal<string | null>(null);

  job = signal<TryOnJob | null>(null);
  error = signal<string | null>(null);
  submitting = signal<boolean>(false);
  processingUser = signal<boolean>(false);
  processingOutfit = signal<boolean>(false);
  processingTop = signal<boolean>(false);
  processingBottom = signal<boolean>(false);
  processingShoes = signal<boolean>(false);
  generationsRemaining = signal<number | null>(null);
  quotaExceeded = signal<boolean>(false);
  checkoutLoading = signal<boolean>(false);
  checkoutStatus = signal<'success' | 'processing' | null>(null);
  confirmedTier = signal<string | null>(null);
  showHelp = signal<boolean>(false);
  userTier = signal<string | null>(null);
  accessories = signal<AccessoryItem[]>([]);

  // Outfit is exclusive with Top/Bottom
  outfitDisabled = signal<boolean>(false);
  topBottomDisabled = signal<boolean>(false);

  private pollSub?: Subscription;
  private updateExclusivity(): void {
    // if outfit is set, disable top/bottom; if top or bottom is set, disable outfit
    this.topBottomDisabled.set(this.outfitImage !== null);
    this.outfitDisabled.set(this.topImage !== null || this.bottomImage !== null);
  }
 

  // tier options for the upgrade prompt (mirrors config/tiers.php)
tiers = [
  { name: 'Basic', price: '$1.99', generations: 10, id: 'basic' },
  { name: 'Pro',   price: '$2.99', generations: 20, id: 'pro' },
];



  
  
ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    if (params['checkout'] === 'success') {
      this.confirmUpgrade();
    } else if (params['checkout'] === 'cancel') {
      // optional: handle the cancel redirect quietly, or show a soft message
    }
  });

  // load current quota status on page load
  this.subscriptionService.getCurrentUser().subscribe({
    next: (user) => {
      this.generationsRemaining.set(user.generations_remaining);
      this.userTier.set(user.tier);
    },
    error: () => {},
  });
}

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

// generic handler for the garment slots
async onSlotSelected(event: Event, slot: 'outfit' | 'top' | 'bottom' | 'shoes'): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null;
  if (!file) return;
  this.error.set(null);

  const processingSignal = {
    outfit: this.processingOutfit,
    top: this.processingTop,
    bottom: this.processingBottom,
    shoes: this.processingShoes,
  }[slot];

  const previewSignal = {
    outfit: this.outfitImagePreview,
    top: this.topImagePreview,
    bottom: this.bottomImagePreview,
    shoes: this.shoesImagePreview,
  }[slot];

  processingSignal.set(true);
  try {
    const processed = await this.imageProcessor.process(file);
    // assign to the right file property
    if (slot === 'outfit') this.outfitImage = processed;
    else if (slot === 'top') this.topImage = processed;
    else if (slot === 'bottom') this.bottomImage = processed;
    else if (slot === 'shoes') this.shoesImage = processed;

    previewSignal.set(URL.createObjectURL(processed));
    this.updateExclusivity();
  } catch {
    this.error.set('Could not process that image. Try a different photo.');
  } finally {
    processingSignal.set(false);
  }
}

// clear a single slot (for a remove/change action)
clearSlot(slot: 'outfit' | 'top' | 'bottom' | 'shoes'): void {
  if (slot === 'outfit') { this.outfitImage = null; this.outfitImagePreview.set(null); }
  else if (slot === 'top') { this.topImage = null; this.topImagePreview.set(null); }
  else if (slot === 'bottom') { this.bottomImage = null; this.bottomImagePreview.set(null); }
  else if (slot === 'shoes') { this.shoesImage = null; this.shoesImagePreview.set(null); }
  this.updateExclusivity();
}

submit(): void {
  if (!this.userImage) {
    this.error.set('Please add a photo of yourself.');
    return;
  }

  const garments = {
    outfit: this.outfitImage,
    top: this.topImage,
    bottom: this.bottomImage,
    shoes: this.shoesImage,
  };

   // only accessories that actually have an image
   const filledAccessories = this.accessories().filter(a => a.file !== null);

   const hasGarment =
   Object.values(garments).some(g => g !== null) || filledAccessories.length > 0;
 if (!hasGarment) {
   this.error.set('Please add at least one clothing item.');
   return;
 }
  this.error.set(null);
  this.submitting.set(true);
  this.job.set(null);

  this.tryOnService.create(this.userImage, garments, filledAccessories).subscribe({
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
    this.error.set(null);
  
    // Keep the person image — clear all garment slots and result
    this.outfitImage = null; this.outfitImagePreview.set(null);
    this.topImage = null; this.topImagePreview.set(null);
    this.bottomImage = null; this.bottomImagePreview.set(null);
    this.shoesImage = null; this.shoesImagePreview.set(null);
    this.updateExclusivity();
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
    this.checkoutLoading.set(true);
    this.subscriptionService.checkout(tierId).subscribe({
      next: (res) => {
        window.location.href = res.checkout_url;
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Could not start checkout.');
      },
    });
  }

  dismissUpgrade(): void {
    this.quotaExceeded.set(false);
  }

  private confirmUpgrade(): void {
    this.subscriptionService.getCurrentUser().subscribe({
      next: (user) => {
        if (user.tier === 'basic' || user.tier === 'pro') {
          this.confirmedTier.set(user.tier);
          this.checkoutStatus.set('success');
          // also refresh the remaining-generations display
          this.generationsRemaining.set(user.generations_remaining);
          // make sure the upgrade modal is dismissed if it was open
          this.quotaExceeded.set(false);
        } else {
          // webhook probably hasn't landed yet
          this.checkoutStatus.set('processing');
        }
        this.router.navigate([], {
          queryParams: { checkout: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      
      }, 
      error: () => {
        this.checkoutStatus.set('processing');
      },
    });
  }

  dismissCheckoutBanner(): void {
    this.checkoutStatus.set(null);
  }

  toggleHelp(): void {
    this.showHelp.update(v => !v);
  }

  
}