import { Component, Input } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { NotificationType, PSUState } from '../../../model';
import { ConfigService } from '../../../services/config.service';
import { EnclosureService } from '../../../services/enclosure/enclosure.service';
import { NotificationService } from '../../../services/notification.service';
import { PrinterService } from '../../../services/printer/printer.service';
import { SystemService } from '../../../services/system/system.service';

const SpecialCommandRegex = /\[!([\w_]+)\]/;

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

  private commands = {
    DISCONNECT: () => this.disconnectPrinter(),
    STOPDASHBOARD: () => this.stopOctoDash(),
    RELOAD: () => this.reloadOctoPrint(),
    REBOOT: () => this.rebootPi(),
    SHUTDOWN: () => this.shutdownPi(),
    KILL: () => this.kill(),
    POWEROFF: () => this.enclosureService.setPSUState(PSUState.OFF),
    POWERON: () => this.enclosureService.setPSUState(PSUState.ON),
    POWERTOGGLE: () => this.enclosureService.togglePSU(),
    WEB: value => this.openIframe(value),
    NEOPIXEL: (...values) => this.setLEDColor(values[0], values[1], values[2], values[3]),
    OUTPUT: (...values) => this.setOutput(values[0], values[1]),
    OUTPUT_PWM: (...values) => this.setOutputPWM(values[0], values[1]),
    ENC_SHELL: value => this.runEnclosureShell(value),
  };

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
    if (command.startsWith('[!')) {
      const specialCommand = command.match(SpecialCommandRegex)[0];
      const values = command.replace(SpecialCommandRegex, '').split(',');

      if (!(specialCommand in this.commands)) {
        this.notificationService.setNotification({
          heading: $localize`:@@error-custom-action-invalid:Unknown special command!`,
          text: $localize`:@@error-custom-action-invalid-desc:The special command you have entered is unknown.`,
          type: NotificationType.ERROR,
          time: new Date(),
        });
        return;
      }

      this.commands[specialCommand](...values);
      return;
    }

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
