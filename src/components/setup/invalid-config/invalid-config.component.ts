import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NotificationService } from 'src/services/notification.service';

import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-config-invalid',
  templateUrl: './invalid-config.component.html',
  styleUrls: ['./invalid-config.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
          $localize`:@@config-reloaded-title:Configuration has been reset to default values.`,
          $localize`:@@config-reloaded-body:Please reload the page`,
          true,
        );
      },
      error: error => {
        this.resetting.set(false);
        this.notificationService.error(
          $localize`:@@error-resetting-config: Error resetting config`,
          error.message,
          true,
        );
      },
    });
  }
}
