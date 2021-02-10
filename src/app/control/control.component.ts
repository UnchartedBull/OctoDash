import { Component } from '@angular/core';

import { OctoprintPrinterProfile } from '../model/octoprint/printer-profile.model';
import { PrinterService } from '../printer.service';
import { PrinterProfileService } from '../printerprofile.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent {
  public printerProfile: OctoprintPrinterProfile;

  public jogDistance = 10;
  public showHelp = false;

  public constructor(private printerService: PrinterService, private printerProfileService: PrinterProfileService) {
    this.printerProfile = {
      name: '_default',
      model: 'unknown',
      current: true,
      axes: {
        x: { inverted: false },
        y: { inverted: false },
        z: { inverted: false },
      },
    };

    this.printerProfileService.getDefaultPrinterProfile().then(profile => {
      this.printerProfile = profile;
    });
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
