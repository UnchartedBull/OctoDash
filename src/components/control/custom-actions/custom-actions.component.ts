import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { PSUState, NotificationType } from '../../../model';
import { ConfigService } from '../../../services/config.service';
import { EnclosureService } from '../../../services/enclosure/enclosure.service';
import { PrinterService } from '../../../services/printer/printer.service';
import { SystemService } from '../../../services/system/system.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-custom-actions',
  templateUrl: './custom-actions.component.html',
  styleUrls: ['./custom-actions.component.scss'],
  standalone: false,
})
export class CustomActionsComponent {
  @Input() redirectActive = true;
  @Input() disablePrinterCommands = false;

  public customActions = [];
  public iframeURL: SafeResourceUrl = 'about:blank';
  public iframeOpen = false;
  public actionToConfirm: ActionToConfirm;

  constructor(
    private printerService: PrinterService,
    private systemService: SystemService,
    private configService: ConfigService,
    private enclosureService: EnclosureService,
    private notificationService: NotificationService,
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
      command.split('; ').forEach(this.executeGCode.bind(this));
      if (exit && this.redirectActive) {
        this.router.navigate(['/main-screen']);
      }
      this.hideConfirm();
    }
  }

  public hideConfirm(): void {
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
        this.enclosureService.setPSUState(PSUState.OFF);
        break;
      case '[!POWERON]':
        this.enclosureService.setPSUState(PSUState.ON);
        break;
      case '[!POWERTOGGLE]':
        this.enclosureService.togglePSU();
        break;
      default: {
        if (command.includes('[!WEB]')) {
          this.openIframe(command.replace('[!WEB]', ''));
        } else if (command.includes('[!NEOPIXEL]')) {
          const values = command.replace('[!NEOPIXEL]', '').split(',');
          this.setLEDColor(values[0], values[1], values[2], values[3]);
        } else if (command.includes('[!OUTPUT]')) {
          const values = command.replace('[!OUTPUT]', '').split(',');
          this.setOutput(values[0], values[1]);
        } else if (command.includes('[!OUTPUT_PWM]')) {
          const values = command.replace('[!OUTPUT_PWM]', '').split(',');
          this.setOutputPWM(values[0], values[1]);
        } else if (command.includes('[!ENC_SHELL]')) {
          const values = command.replace('[!ENC_SHELL]', '').split(',');
          this.runEnclosureShell(values[0]);
        } else {
          if (this.disablePrinterCommands) {
            this.notificationService.setNotification({
              heading: $localize`:@@error-custom-action-disabled:Printer commands are not available!`,
              text: $localize`:@@error-custom-action-disabled-desc:Please connect to your printer first before attempting to use a printer command.`,
              type: NotificationType.ERROR,
              time: new Date(),
            });
          } else {
            this.printerService.executeGCode(command);
          }
        }
        break;
      }
    }
  }

  // [!DISCONNECT]
  private disconnectPrinter(): void {
    this.printerService.disconnectPrinter();
  }

  // [!STOPDASHBOARD]
  private stopOctoDash(): void {
    window.close();
  }

  // [!RELOAD]
  private reloadOctoPrint(): void {
    this.systemService.sendCommand('restart');
  }

  // [!REBOOT]
  private rebootPi(): void {
    this.systemService.sendCommand('reboot');
  }

  // [!SHUTDOWN]
  private shutdownPi(): void {
    this.systemService.sendCommand('shutdown');
  }

  // [!KILL]
  private kill(): void {
    this.shutdownPi();
    setTimeout(this.stopOctoDash, 500);
  }

  // [!WEB]
  private openIframe(url: string): void {
    this.iframeURL = url;
    this.iframeOpen = true;
  }

  public hideIframe(): void {
    this.iframeOpen = false;
  }

  private setLEDColor(identifier: string, red: string, green: string, blue: string): void {
    this.enclosureService.setLEDColor(Number(identifier), Number(red), Number(green), Number(blue));
  }

  private setOutput(identifier: string, status: string): void {
    console.log(identifier);
    this.enclosureService.setOutput(Number(identifier), status === 'true' || status === 'on');
  }

  private setOutputPWM(identifier: string, dutyCycle: string): void {
    this.enclosureService.setOutputPWM(Number(identifier), Number(dutyCycle));
  }

  private runEnclosureShell(identifier: string): void {
    this.enclosureService.runEnclosureShell(Number(identifier));
  }
}

interface ActionToConfirm {
  command: string;
  exit: boolean;
}
