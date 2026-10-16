import { Component, inject, model, input, output, computed } from '@angular/core';
import { ImageProcessorService } from '../../services/image-processor.service';
import { AccessoryItem } from '../../models/accessory';

@Component({
  selector: 'app-accessories',
  standalone: true,
  imports: [],
  templateUrl: './accessories.component.html',
  styleUrl: './accessories.component.scss',
})
export class AccessoriesComponent {
  private imageProcessor = inject(ImageProcessorService);

  // two-way bound to the parent — parent always sees the current list
  accessories = model<AccessoryItem[]>([]);

  private nextAccessoryId = 0;

  accessoryTypes = [
    { value: 'watch',    label: 'Watch' },
    { value: 'scarf',    label: 'Scarf' },
    { value: 'tie',      label: 'Tie' },
    { value: 'earrings', label: 'Earrings' },
    { value: 'hat',      label: 'Hat' },
    { value: 'necklace', label: 'Necklace' },
    { value: 'belt',     label: 'Belt' },
    { value: 'glasses',  label: 'Glasses' },
    { value: 'bag',      label: 'Bag' },
  ];

  error = model<string | null>(null);   // surface processing errors to the parent

  // the user's per-look accessory cap, from the parent
  limit = input<number>(1);

  // ask the parent to show the upgrade modal
  upgradeRequested = output<void>();

  // how many accessories are currently added
  count = computed(() => this.accessories().length);

  // whether the user can add more
  atLimit = computed(() => this.count() >= this.limit());


  addAccessory(): void {
    this.accessories.update(list => [
      ...list,
      { id: this.nextAccessoryId++, file: null, preview: null, type: 'watch', processing: false },
    ]);
  }

  removeAccessory(id: number): void {
    this.accessories.update(list => list.filter(a => a.id !== id));
  }

  setAccessoryType(id: number, type: string): void {
    this.accessories.update(list =>
      list.map(a => a.id === id ? { ...a, type } : a)
    );
  }

  async onAccessorySelected(event: Event, id: number): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    if (!file) return;
    this.error.set(null);

    this.accessories.update(list =>
      list.map(a => a.id === id ? { ...a, processing: true } : a)
    );

    try {
      const processed = await this.imageProcessor.process(file);
      const preview = URL.createObjectURL(processed);
      this.accessories.update(list =>
        list.map(a => a.id === id ? { ...a, file: processed, preview, processing: false } : a)
      );
    } catch {
      this.error.set('Could not process that image. Try a different photo.');
      this.accessories.update(list =>
        list.map(a => a.id === id ? { ...a, processing: false } : a)
      );
    }
  }

   // guard addAccessory against the limit
   tryAddAccessory(): void {
    if (this.atLimit()) {
      this.upgradeRequested.emit();
      return;
    }
    this.addAccessory();
  }
}
