import { Component, output } from '@angular/core';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [],
  templateUrl: './help-modal.component.html',
  styleUrl: './help-modal.component.scss'
})
export class HelpModalComponent {
  // emitted when the user closes the modal
  close = output<void>();
}
