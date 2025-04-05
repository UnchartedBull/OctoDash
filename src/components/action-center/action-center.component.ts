import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable, Subscription } from 'rxjs';

import { PrinterState, PrinterStatus, PSUState, CustomAction } from '../../model';
import { ConfigService } from '../../services/config.service';
import { EnclosureService } from '../../services/enclosure/enclosure.service';
import { NotificationService } from '../../services/notification.service';
import { PrinterService } from '../../services/printer/printer.service';
import { SocketService } from '../../services/socket/socket.service';
import { SystemService } from '../../services/system/system.service';

const SpecialCommandRegex = /\[!([\w_]+)\]/;

@Component({
  selector: 'app-action-center',
  templateUrl: './action-center.component.html',
  styleUrls: ['./action-center.component.scss'],
  standalone: false,
})
export class ActionCenterComponent implements OnInit, OnDestroy {
  @Input() closeEvent: Observable<void>;
  private eventsSubscription: Subscription;

  public visible = false;
  public editing = false;
  public editingAction = -1;

  public customActions = [];
  public iframeURL: SafeResourceUrl = 'about:blank';
  public iframeOpen = false;
  public actionToConfirm: ActionToConfirm;
  public printerConnected = false;

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
    private socketService: SocketService,
    private configService: ConfigService,
    private enclosureService: EnclosureService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.customActions = this.configService.getCustomActions();

    this.socketService.getPrinterStatusSubscribable().subscribe((printerStatus: PrinterStatus) => {
      this.printerConnected = [
        PrinterState.operational,
        PrinterState.pausing,
        PrinterState.paused,
        PrinterState.printing,
        PrinterState.cancelling,
      ].includes(printerStatus?.status);
    });
  }

  ngOnInit() {
    this.eventsSubscription = this.closeEvent.subscribe(() => {
      this.visible = false;
      this.editing = false;
      this.editingAction = -1;
    });
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

  private updateActionsInConfig() {
    const config = this.configService.getCurrentConfig();
    config.octodash.customActions = this.customActions;
    this.configService.saveConfig(config);
  }

  public reorderAction(event: CdkDragDrop<CustomAction[]>) {
    moveItemInArray(this.customActions, event.previousIndex, event.currentIndex);
    this.updateActionsInConfig();
  }

  public addAction() {
    this.customActions.push({
      icon: 'plus',
      command: '',
      color: '#ffffff',
      confirm: false,
      exit: false,
    });
    this.editingAction = this.customActions.length - 1;
  }

  public deleteAction(index: number) {
    this.customActions.splice(index, 1);
    this.updateActionsInConfig();
  }

  // -=- ACTIONS -=-

  public doAction(command: string, exit: boolean, confirm: boolean): void {
    if (confirm) {
      this.actionToConfirm = {
        command,
        exit,
      };
    } else {
      command.split('; ').forEach(this.executeGCode.bind(this));
      if (exit) {
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
        this.notificationService.error(
          $localize`:@@error-custom-action-invalid:Unknown special command!`,
          $localize`:@@error-custom-action-invalid-desc:The special command you have entered is unknown.`,
        );
        return;
      }

      this.commands[specialCommand](...values);
      return;
    }

    if (!this.printerConnected) {
      this.notificationService.error(
        $localize`:@@error-custom-action-disabled:Printer commands are not available!`,
        $localize`:@@error-custom-action-disabled-desc:Please connect to your printer first before attempting to use a printer command.`,
      );
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
