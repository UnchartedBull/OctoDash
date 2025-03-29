import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { NotificationType, PrinterStatus } from '../../model';
import { OctoprintPrinterProfile } from '../../model/octoprint';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { PrinterService } from '../../services/printer/printer.service';
import { SocketService } from '../../services/socket/socket.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  standalone: false,
})
export class ControlComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public printerStatus: PrinterStatus;

  public printerProfile: OctoprintPrinterProfile;

  public jogDistance = 10;
  public selectedTool = 0;
  public showExtruder = false;
  public quickControlShown = false;
  public hotendTarget: number;

  public constructor(
    private printerService: PrinterService,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private socketService: SocketService,
    private router: Router,
  ) {
    this.hotendTarget = this.configService.getDefaultHotendTemperature();
    this.showExtruder = this.configService.getShowExtruderControl();
    this.printerService.getActiveProfile().subscribe({
      next: (printerProfile: OctoprintPrinterProfile) => (this.printerProfile = printerProfile),
      error: (error: HttpErrorResponse) => {
        this.notificationService.setNotification({
          heading: $localize`:@@error-printer-profile:Can't retrieve printer profile!`,
          text: error.message,
          type: NotificationType.ERROR,
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

  public goToMainScreen(): void {
    this.router.navigate(['/main-screen']);
  }

  private showQuickControl(): void {
    this.quickControlShown = true;
    setTimeout((): void => {
      const controlViewDOM = document.getElementById('quickControl');
      controlViewDOM.style.opacity = '1';
    }, 50);
  }

  public hideQuickControl(): void {
    const controlViewDOM = document.getElementById('quickControl');
    controlViewDOM.style.opacity = '0';
    setTimeout((): void => {
      this.quickControlShown = false;
    }, 500);
  }

  private quickControlChangeValue(value: number): void {
    this.hotendTarget += value;
    if (this.hotendTarget < -999) {
      this.hotendTarget = this.configService.getDefaultHotendTemperature();
    } else if (this.hotendTarget < 0) {
      this.hotendTarget = 0;
    } else if (this.hotendTarget > 999) {
      this.hotendTarget = 999;
    }
  }

  private quickControlSetValue(): void {
    this.printerService.setTemperatureHotend(this.hotendTarget, this.selectedTool);
    this.hideQuickControl();
  }
}
