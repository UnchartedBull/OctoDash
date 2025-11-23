import { Component, inject } from '@angular/core';
import { QuickControlService, QuickControlView } from 'src/services/quick-control.service';

@Component({
  selector: 'app-quick-control-modal',
  templateUrl: './quick-control-modal.component.html',
  styleUrls: ['./quick-control-modal.component.scss'],
  standalone: false,
})
export class QuickControlModalComponent {
  quickControlService = inject(QuickControlService);

  QuickControlView = QuickControlView;

  icon: string = this.quickControlService.getIconForView();
  onBack() {
    this.quickControlService.hideQuickControl();
  }
}
