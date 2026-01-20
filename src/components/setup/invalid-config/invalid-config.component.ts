import { Component, inject, signal } from '@angular/core';

import { ConfigService } from '../../../services/config.service';
import { NotificationService } from 'src/services/notification.service';

@Component({
  selector: 'app-config-invalid',
  templateUrl: './invalid-config.component.html',
  styleUrls: ['./invalid-config.component.scss'],
  standalone: false,
})
export class ConfigInvalidComponent {
  private configService = inject(ConfigService);
  private notificationService = inject(NotificationService);
  public errors = this.configService.getErrors();

  public resetting = signal<boolean>(false);

  public reloadPage(): void {
    window.location.href = '/plugin/octodash/';
  }

  public resetConfig(): void {
    this.resetting.set(true);
    this.configService.resetConfig().subscribe({
      next: () => {
        this.resetting.set(false);
        this.notificationService.info(
          'Configuration has been reset to default values.',
          'Please reload the page',
          true,
        );
      },
      error: error => {
        this.resetting.set(false);
        this.notificationService.error('Failed to reset configuration.', error.message, true);
      },
    });
  }
}
