import { Component } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { ConfigService } from '../config/config.service';
import { OctoprintService } from '../octoprint.service';
import { OctoprintPrinterProfile } from '../octoprint/model/printerProfile';
import { EnclosureService } from '../plugin-service/enclosure.service';
import { PsuControlService } from '../plugin-service/psu-control.service';
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
  public customActions = [];
  public showHelp = false;
  public iFrameURL: SafeResourceUrl = 'about:blank';
  public actionToConfirm: ActionToConfirm;

  public constructor(
    private printerService: PrinterService,
    private printerProfileService: PrinterProfileService,
    private octoprintService: OctoprintService,
    private configService: ConfigService,
    private psuControlService: PsuControlService,
    private enclosureService: EnclosureService,
    private router: Router,
  ) {
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

    this.customActions = this.configService.getCustomActions();

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

  public doAction(command: string, exit: boolean, confirm: boolean): void {
    if (confirm) {
      this.actionToConfirm = {
        command,
        exit,
      };
    } else {
      this.executeGCode(command);
      if (exit) {
        this.router.navigate(['/main-screen']);
      }
    }
  }

  public doActionConfirm(): void {
    this.executeGCode(this.actionToConfirm.command);
    if (this.actionToConfirm.exit) {
      this.router.navigate(['/main-screen']);
    } else {
      this.actionToConfirm = null;
    }
  }

  public doActionNoConfirm(): void {
    this.actionToConfirm = null;
  }

  private executeGCode(command: string): void {
    switch (command) {
      case '[!DISCONNECT]':
        this.disconnectPrinter();
        break;
      case '[!STOPDASHBOARD]':
        this.stopOctoDash();
        break;
      case '[!RELOAD]':
        this.reloadOctoPrint();
        break;
      case '[!REBOOT]':
        this.rebootPi();
        break;
      case '[!SHUTDOWN]':
        this.shutdownPi();
        break;
      case '[!KILL]':
        this.kill();
        break;
      case '[!POWEROFF]':
        this.psuControlService.changePSUState(false);
        break;
      case '[!POWERON]':
        this.psuControlService.changePSUState(true);
        break;
      case '[!POWERTOGGLE]':
        this.psuControlService.togglePSU();
        break;
      default: {
        if (command.includes('[!WEB]')) {
          this.openIFrame(command.replace('[!WEB]', ''));
        } else if (command.includes('[!NEOPIXEL]')) {
          const values = command.replace('[!NEOPIXEL]', '').split(',');
          this.setLEDColor(values[0], values[1], values[2], values[3]);
        } else {
          this.printerService.executeGCode(command);
        }
        break;
      }
    }
  }

  // [!DISCONNECT]
  public disconnectPrinter(): void {
    this.octoprintService.disconnectPrinter();
  }

  // [!STOPDASHBOARD]
  public stopOctoDash(): void {
    window.close();
  }

  // [!RELOAD]
  public reloadOctoPrint(): void {
    this.octoprintService.sendSystemCommand('restart');
  }

  // [!REBOOT]
  public rebootPi(): void {
    this.octoprintService.sendSystemCommand('reboot');
  }

  // [!SHUTDOWN]
  public shutdownPi(): void {
    this.octoprintService.sendSystemCommand('shutdown');
  }

  // [!KILL]
  public kill(): void {
    this.shutdownPi();
    setTimeout(this.stopOctoDash, 500);
  }

  // [!WEB]
  public openIFrame(url: string): void {
    this.iFrameURL = url;
    const iFrameDOM = document.getElementById('iFrame');
    iFrameDOM.style.display = 'block';
    setTimeout((): void => {
      iFrameDOM.style.opacity = '1';
    }, 50);
  }

  public hideIFrame(): void {
    const iFrameDOM = document.getElementById('iFrame');
    iFrameDOM.style.opacity = '0';
    setTimeout((): void => {
      iFrameDOM.style.display = 'none';
      this.iFrameURL = 'about:blank';
    }, 500);
  }

  public setLEDColor(identifier: string, red: string, green: string, blue: string): void {
    this.enclosureService.setLEDColor(Number(identifier), Number(red), Number(green), Number(blue));
  }
}

interface ActionToConfirm {
  command: string;
  exit: boolean;
}
