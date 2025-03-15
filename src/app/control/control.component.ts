import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { NotificationType, PrinterStatus } from '../model';
import { OctoprintPrinterProfile } from '../model/octoprint';
import { NotificationService } from '../notification/notification.service';
import { PrinterService } from '../services/printer/printer.service';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public printerStatus: PrinterStatus;

  public printerProfile: OctoprintPrinterProfile;

  public jogDistance = 10;
  public selectedTool = 0;
  public showExtruder = false;

  public constructor(
    private printerService: PrinterService,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private socketService: SocketService,
  ) {
    this.showExtruder = this.configService.getShowExtruderControl();
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

  public ngOnInit(): void {
    this.subscriptions.add(
      this.socketService.getPrinterStatusSubscribable().subscribe((status: PrinterStatus): void => {
        this.printerStatus = status;
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public setDistance(distance: number): void {
    this.jogDistance = distance;
  }

  public setTool(tool: number): void {
    this.selectedTool = tool;
    this.printerService.setTool(tool);
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
