import { Component } from '@angular/core';
import { PrinterService } from '../printer.service';
import { ConfigService } from '../config/config.service';
import { OctoprintService } from '../octoprint.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent {
  jogDistance = 10;
  customActions = [];
  showHelp = false;

  constructor(private printerService: PrinterService, private octoprintService: OctoprintService, private configService: ConfigService) {
    this.customActions = this.configService.getCustomActions();
  }

  setDistance(distance: number) {
    this.jogDistance = distance;
  }

  moveAxis(axis: string, direction: '+' | '-') {
    const distance = Number(direction + this.jogDistance);
    this.printerService.jog(
      axis === 'x' ? distance : 0,
      axis === 'y' ? distance : 0,
      axis === 'z' ? distance : 0,
    );
  }

  executeGCode(command: string) {
    switch (command) {
      case '[!DISCONNECT]': this.disconnectPrinter(); break;
      case '[!STOPDASHBOARD]': this.stopOctoDash(); break;
      case '[!RELOAD]': this.reloadOctoPrint(); break;
      case '[!REBOOT]': this.rebootPi(); break;
      case '[!SHUTDOWN]': this.shutdownPi(); break;
      case '[!KILL]': this.kill(); break;
      default: {
        this.printerService.executeGCode(command);
        break;
      }
    }
  }

  // [!DISCONNECT]
  disconnectPrinter() {
    this.octoprintService.disconnectPrinter();
  }

  // [!STOPDASHBOARD]
  stopOctoDash() {
    window.close();
  }

  // [!RELOAD]
  reloadOctoPrint() {
    this.octoprintService.sendSystemCommand('restart');
  }

  // [!REBOOT]
  rebootPi() {
    this.octoprintService.sendSystemCommand('reboot');
  }

  // [!SHUTDOWN]
  shutdownPi() {
    this.octoprintService.sendSystemCommand('shutdown');
  }

  // [!KILL]
  kill() {
    this.shutdownPi();
    setTimeout(this.stopOctoDash, 500);
  }
}
