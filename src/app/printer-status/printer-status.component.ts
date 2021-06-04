import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { PrinterStatus } from '../model';
import { PrinterService } from '../services/printer/printer.service';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-printer-status',
  templateUrl: './printer-status.component.html',
  styleUrls: ['./printer-status.component.scss'],
})
export class PrinterStatusComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public printerStatus: PrinterStatus;
  public fanSpeed: number;
  public status: string;

  public hotendTarget: number;
  public heatbedTarget: number;
  public fanTarget: number;

  public QuickControlView = QuickControlView;
  public view = QuickControlView.NONE;

  public constructor(
    private printerService: PrinterService,
    private configService: ConfigService,
    private socketService: SocketService,
  ) {
    this.hotendTarget = this.configService.getDefaultHotendTemperature();
    this.heatbedTarget = this.configService.getDefaultHeatbedTemperature();
    this.fanTarget = this.configService.getDefaultFanSpeed();
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

  private showQuickControl(): void {
    setTimeout((): void => {
      const controlViewDOM = document.getElementById('quickControl');
      controlViewDOM.style.opacity = '1';
    }, 50);
  }

  public hideQuickControl(): void {
    const controlViewDOM = document.getElementById('quickControl');
    controlViewDOM.style.opacity = '0';
    setTimeout((): void => {
      this.view = QuickControlView.NONE;
    }, 500);
  }

  public showQuickControlHotend(): void {
    this.view = QuickControlView.HOTEND;
    this.showQuickControl();
  }

  public showQuickControlHeatbed(): void {
    this.view = QuickControlView.HEATBED;
    this.showQuickControl();
  }

  public showQuickControlFan(): void {
    this.view = QuickControlView.FAN;
    this.showQuickControl();
  }

  private changeValue(item: string, value: number, defaultValue: number) {
    this[item] += value;
    if (this[item] < -999) {
      this[item] = defaultValue;
    } else if (this[item] < 0) {
      this[item] = 0;
    } else if (this[item] > 999) {
      this[item] = 999;
    }
  }

  public quickControlSettings(): any {
    const settings = {
      hotend: {
        image: 'nozzle.svg',
        target: this.hotendTarget,
        unit: '°C',
        changeValue: (value: number) => this.changeValue(
          'hotendTarget',
          value,
          this.configService.getDefaultHotendTemperature()
        ),
        setValue: () => {
          this.printerService.setTemperatureHotend(this.hotendTarget);
          this.hideQuickControl();
        },
      },
      heatbed: {
        image: 'heat-bed.svg',
        target: this.heatbedTarget,
        unit: '°C',
        changeValue: (value: number) => this.changeValue(
          'heatbedTarget',
          value,
          this.configService.getDefaultHeatbedTemperature()
        ),
        setValue: () => {
          this.printerService.setTemperatureBed(this.heatbedTarget);
          this.hideQuickControl();
        },
      },
      fan: {
        image: 'fan.svg',
        target: this.fanTarget,
        unit: '%',
        changeValue: (value: number) => this.changeValue(
          'fanTarget',
          value,
          this.configService.getDefaultFanSpeed()
        ),
        setValue: () => {
          this.printerService.setFanSpeed(this.fanTarget);
          this.hideQuickControl();
        },
      },
    };
    for (let item in settings) {
      settings[item].smallStep = 1;
      settings[item].bigStep = 10;
      settings[item].reset = -999;
    }
    switch (this.view) {
      case QuickControlView.HOTEND:
        return settings.hotend;
      case QuickControlView.HEATBED:
        return settings.heatbed;
      case QuickControlView.FAN:
        return settings.fan;
    }
  }
}

enum QuickControlView {
  NONE,
  HOTEND,
  HEATBED,
  FAN,
}
