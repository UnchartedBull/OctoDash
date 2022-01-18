import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';

import { ConfigService } from '../config/config.service';
import { NotificationType } from '../model';
import { OctoprintPrinterProfile } from '../model/octoprint';
import { NotificationService } from '../notification/notification.service';
import { PrinterService } from '../services/printer/printer.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent {
  public printerProfile: OctoprintPrinterProfile;

  public jogDistance = 10;
  public showExtruder = this.configService.getShowExtruderControl();

  public constructor(
    private printerService: PrinterService,
    private configService: ConfigService,
    private notificationService: NotificationService,
  ) {
    this.printerService.getActiveProfile().subscribe({
      next: (printerProfile: OctoprintPrinterProfile) => (this.printerProfile = printerProfile),
      error: (error: HttpErrorResponse) => {
        this.notificationService.setNotification({
          heading: $localize`:@@error-printer-profile:Can't retrieve printer profile!`,
          text: error.message,
          type: NotificationType.ERROR,
          time: new Date(),
          sticky: true,
        });
      },
    });
  }

  public setDistance(distance: number): void {
    this.jogDistance = distance;
  }

  public extrude(direction: '+' | '-'): void {
    if (this.printerProfile.axes['e'].inverted == true) {
      direction = direction === '+' ? '-' : '+';
    }
    const distance = Number(direction + this.jogDistance);
    this.printerService.extrude(distance, this.configService.getFeedSpeed());
  }

  public moveAxis(axis: string, direction: '+' | '-'): void {
    if (this.printerProfile.axes[axis].inverted == true) {
      direction = direction === '+' ? '-' : '+';
    }

    const distance = Number(direction + this.jogDistance);

    this.printerService.jog(axis === 'x' ? distance : 0, axis === 'y' ? distance : 0, axis === 'z' ? distance : 0);
  }
}
