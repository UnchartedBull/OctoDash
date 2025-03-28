import { Component } from '@angular/core';

import { AppService } from '../../services/app.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-settings-icon',
  templateUrl: './settings-icon.component.html',
  styleUrls: ['./settings-icon.component.scss'],
  standalone: false,
})
export class SettingsIconComponent {
  public constructor(
    public service: AppService,
    public configService: ConfigService,
  ) {}

  public settingsVisible = false;

  public showSettings(): void {
    this.settingsVisible = true;
  }

  public hideSettings(): void {
    setTimeout((): void => {
      this.settingsVisible = false;
    }, 350);
  }
}
