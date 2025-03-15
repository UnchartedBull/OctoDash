import { Component } from '@angular/core';

import { AppService } from '../app.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent {
  public constructor(public service: AppService) {}

  public settings = false;

  public showSettings(): void {
    this.settings = true;
  }

  public hideSettings(): void {
    setTimeout((): void => {
      this.settings = false;
    }, 350);
  }
}
