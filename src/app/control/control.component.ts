import { Component, OnInit } from '@angular/core';
import { PrinterService } from '../printer.service';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss']
})
export class ControlComponent {
  jogDistance = 10;
  customControls = [
    {
      icon: 'home',
      command: 'G28',
      color: '#dcdde1'
    },
    {
      icon: 'ruler-vertical',
      command: 'G29',
      color: '#44bd32'
    },
    {
      icon: 'fire-alt',
      command: 'M140 S50; M104 S185',
      color: '#e1b12c'
    },
    {
      icon: 'snowflake',
      command: 'M140 S0; M104 S0',
      color: '#0097e6'
    },
    {
      icon: 'redo-alt',
      command: '[!RELOAD]',
      color: '#7f8fa6'
    },
    {
      icon: 'skull',
      command: '[!KILL]',
      color: '#e84118'
    }
  ];

  constructor(private printerService: PrinterService) { }

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
    // http://docs.octoprint.org/en/master/api/connection.html
  }

  // [!STOPDASHBOARD]
  stopOctoDash() {
    window.close();
  }

  // [!RELOAD]
  reloadOctoPrint() {
    // action: restart
    // http://docs.octoprint.org/en/master/api/system.html
  }

  // [!REBOOT]
  rebootPi() {
    // action: reboot
  }

  // [!SHUTDOWN]
  shutdownPi() {
    // action: shutdown
  }

  // [!KILL]
  kill() {
    this.stopOctoDash();
    setTimeout(this.shutdownPi, 500);
  }
}
