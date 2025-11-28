import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileService } from 'src/services/profile/profile.service';
import { QuickControlModalService } from 'src/services/quick-control-modal.service';

import { PrinterStatus } from '../../model';
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
  public selectedHotend = 0;

  public profileService: ProfileService = inject(ProfileService);
  public quickControlService: QuickControlModalService = inject(QuickControlModalService);

  public constructor(
    private printerService: PrinterService,
    private configService: ConfigService,
    private notificationService: NotificationService,
    private socketService: SocketService,
    private router: Router,
  ) {
    this.showExtruder = this.configService.getShowExtruderControl();
    this.printerService.getActiveProfile().subscribe({
      next: (printerProfile: OctoprintPrinterProfile) => (this.printerProfile = printerProfile),
      error: (error: HttpErrorResponse) => {
        this.notificationService.warn(
          $localize`:@@error-printer-profile:Can't retrieve printer profile!`,
          error.message,
          true,
        );
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

  public extruderTrackBy(index: number) {
    // Tracking by index is acceptable because array position IS the unique identifier
    // The number of tools is not likely to change
    return index;
  }
}
