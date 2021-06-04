import { Component } from '@angular/core';

import { OctoprintPrinterProfile } from '../model/octoprint';
import { NotificationService } from '../notification/notification.service';
import { PrinterService } from '../services/printer/printer.service';
import { ConfigService } from '../config/config.service';
import { ZOffset } from '../model';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent {
  public printerProfile: OctoprintPrinterProfile;

  public jogDistance = 10;
  public showHelp = false;
  public showExtruder = this.configService.getShowExtruderControl();
  public zOffset: number = 0.0;
  public zOffsetControl: boolean = false;

  public constructor(
    private printerService: PrinterService,
    private configService: ConfigService,
    private notificationService: NotificationService
  ) {
    this.fetchZOffset();
    this.printerService.getActiveProfile().subscribe(
      (printerProfile: OctoprintPrinterProfile) => (this.printerProfile = printerProfile),
      err => {
        this.notificationService.setError(
          $localize`:@@error-printer-profile:Can't retrieve printer profile!`,
          err.message,
        );
      },
    );
  }

  public setDistance(distance: number): void {
    this.jogDistance = distance;
  }

  public extrude(direction: '+' | '-'): void {
    const distance = Number(direction + this.jogDistance);
    this.printerService.extrude(distance, this.configService.getFeedSpeed());
  }

  public moveAxis(axis: string, direction: '+' | '-'): void {
    if (this.printerProfile.axes[axis].inverted == true) {
      direction = direction === '+' ? '-' : '+';
    }
    const distance = Number(direction + this.jogDistance);
    this.printerService.jog(
      axis === 'x' ? distance : 0,
      axis === 'y' ? distance : 0,
      axis === 'z' ? distance : 0
    );
  }

  private fetchZOffset(): void {
    this.printerService.getZOffset().subscribe((data: ZOffset) => {
      this.zOffset = data.z_offset;
    });
  }

  public getZOffset(): string {
    return this.zOffset.toFixed(2);
  }

  private changeValue(item: string, value: number): void {
    this[item] = Math.round((this[item] + value) * 100) / 100;
    if (this[item] <= -999) {
      this.fetchZOffset()
    }
    console.log(this.zOffset)
  }

  public quickControlSettings() {
    return {
      image: 'height.svg',
      target: this.getZOffset(),
      unit: 'mm',
      smallStep: 0.01,
      bigStep: 0.1,
      reset: -999,
      changeValue: (value: number) => this.changeValue('zOffset', Number(value)),
      setValue: () => {
        this.printerService.setZOffset(this.zOffset);
        setTimeout(() => this.fetchZOffset(), 500);
        this.hideQuickControl();
      },
    }
  }

  public showQuickControl(): void {
    this.zOffsetControl = true;
    setTimeout((): void => {
      const controlViewDOM = document.getElementById('quickControl');
      controlViewDOM.style.opacity = '1';
    }, 50);
  }

  public hideQuickControl(): void {
    const controlViewDOM = document.getElementById('quickControl');
    controlViewDOM.style.opacity = '0';
    setTimeout((): void => {
      this.zOffsetControl = false;
    }, 500);
  }
}
