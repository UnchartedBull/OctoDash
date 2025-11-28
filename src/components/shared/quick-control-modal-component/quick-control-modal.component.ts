import { Component, inject } from '@angular/core';
import { QuickControlModalService, QuickControlView } from 'src/services/quick-control-modal.service';

@Component({
  selector: 'app-quick-control-modal',
  templateUrl: './quick-control-modal.component.html',
  styleUrls: ['./quick-control-modal.component.scss'],
  standalone: false,
})
export class QuickControlModalComponent {
  quickControlService = inject(QuickControlModalService);

  QuickControlView = QuickControlView;

  icon$ = this.quickControlService.iconPath;
  onBack() {
    this.quickControlService.hideQuickControl();
  }
}
