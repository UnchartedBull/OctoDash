import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { ConfigService } from '../../config/config.service';
import { OctoprintService } from '../../octoprint.service';
import { EnclosureService, PsuControlService, TPLinkSmartPlugService } from '../../plugins';
import { PrinterService } from '../../services/printer/printer.service';

@Component({
  selector: 'app-custom-actions',
  templateUrl: './custom-actions.component.html',
  styleUrls: ['./custom-actions.component.scss'],
})
export class CustomActionsComponent {
  @Input() redirectActive = true;

  public customActions = [];
  public iFrameURL: SafeResourceUrl = 'about:blank';
  public actionToConfirm: ActionToConfirm;

  constructor(
    private printerService: PrinterService,
    private octoprintService: OctoprintService,
    private configService: ConfigService,
    private psuControlService: PsuControlService,
    private enclosureService: EnclosureService,
    private tplinkSmartPlugService: TPLinkSmartPlugService,
    private router: Router,
  ) {
    this.customActions = this.configService.getCustomActions();
  }

  public doAction(command: string, exit: boolean, confirm: boolean): void {
    if (confirm) {
      this.actionToConfirm = {
        command,
        exit,
      };
    } else {
      this.executeGCode(command);
      if (exit && this.redirectActive) {
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
      case '[!TPLINKOFF]':
        this.tplinkSmartPlugService.changePowerState(false);
        break;
      case '[!TPLINKON]':
        this.tplinkSmartPlugService.changePowerState(true);
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
    this.printerService.disconnectPrinter();
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
