import { Component, inject } from '@angular/core';

import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-config-invalid',
  templateUrl: './invalid-config.component.html',
  styleUrls: ['./invalid-config.component.scss'],
  standalone: false,
})
export class ConfigInvalidComponent {
  private configService = inject(ConfigService);
  public errors = this.configService.getErrors();

  public reloadPage(): void {
    window.location.href = '/plugin/octodash/';
  }
}
