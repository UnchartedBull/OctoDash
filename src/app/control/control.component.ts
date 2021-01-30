import { Component } from '@angular/core';

import { NotificationService } from '../notification/notification.service';
import { OctoprintPrinterProfile } from '../octoprint/model/printerProfile';
import { PrinterProfileService } from '../octoprint/printer-profile.service';
import { PrinterService } from '../printer.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent {
  public printerProfile: OctoprintPrinterProfile;

  public jogDistance = 10;
  public showHelp = false;

  public constructor(
    private printerService: PrinterService,
    private printerProfileService: PrinterProfileService,
    private notificationService: NotificationService,
  ) {
    this.printerProfileService.getDefaultPrinterProfile().subscribe(
      (printerProfile: OctoprintPrinterProfile) => (this.printerProfile = printerProfile),
      err => {
        this.notificationService.setError("Can't retrieve printer profile!", err.message);
      },
    );
  }

  public setDistance(distance: number): void {
    this.jogDistance = distance;
  }

  public moveAxis(axis: string, direction: '+' | '-'): void {
    if (this.printerProfile.axes[axis].inverted == true) {
      direction = direction === '+' ? '-' : '+';
    }

    const distance = Number(direction + this.jogDistance);

    this.printerService.jog(axis === 'x' ? distance : 0, axis === 'y' ? distance : 0, axis === 'z' ? distance : 0);
  }
}
