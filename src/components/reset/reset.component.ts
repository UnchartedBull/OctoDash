import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { NotificationService } from 'src/services/notification.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
  standalone: false,
})
export class ResetComponent {
  @Output() closeFunction = new EventEmitter<void>(true);

  configService = inject(ConfigService);
  notificationService = inject(NotificationService);

  public closeResetWindow(): void {
    this.closeFunction.emit();
  }

  public reset(): void {
    this.configService.resetConfig().subscribe({
      next: () => {
        window.location.reload();
      },
      error: err => {
        console.error('Error resetting config:', err);
        this.notificationService.error(`:@@error-resetting-config: Error resetting config`, err.message);
      },
    });
  }
}
