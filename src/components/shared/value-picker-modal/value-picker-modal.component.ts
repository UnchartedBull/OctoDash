import { Component, inject } from '@angular/core';
import { QuickControlService, QuickControlView } from 'src/services/quick-control.service';

@Component({
  selector: 'app-value-picker-modal',
  templateUrl: './value-picker-modal.component.html',
  styleUrls: ['./value-picker-modal.component.scss'],
  standalone: false,
})
export class ValuePickerModalComponent {
  quickControlService = inject(QuickControlService);

  QuickControlView = QuickControlView;

  icon: string = this.quickControlService.getIconForView();
  onBack() {
    this.quickControlService.hideQuickControl();
  }
}
