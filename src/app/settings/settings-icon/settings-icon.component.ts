import { Component } from '@angular/core';

import { AppService } from '../../app.service';

@Component({
  selector: 'app-settings-icon',
  templateUrl: './settings-icon.component.html',
  styleUrls: ['./settings-icon.component.scss'],
})
export class SettingsIconComponent {
  public constructor(public service: AppService) {}

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
