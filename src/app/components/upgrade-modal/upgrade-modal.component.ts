import { Component, input, output } from '@angular/core';

interface Tier {
  name: string;
  price: string;
  generations: number;
  id: string;
}

@Component({
  selector: 'app-upgrade-modal',
  standalone: true,
  imports: [],
  templateUrl: './upgrade-modal.component.html',
  styleUrl: './upgrade-modal.component.scss',
})
export class UpgradeModalComponent {
  // inputs from the parent
  tiers = input.required<Tier[]>();
  loading = input<boolean>(false);

  // events up to the parent
  selectTier = output<string>();
  dismiss = output<void>();
}