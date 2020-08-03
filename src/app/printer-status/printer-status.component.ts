import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";

import { ConfigService } from "../config/config.service";
import { PrinterService, PrinterStatusAPI, PrinterValue } from "../printer.service";

@Component({
  selector: "app-printer-status",
  templateUrl: "./printer-status.component.html",
  styleUrls: ["./printer-status.component.scss"],
})
export class PrinterStatusComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public printerStatus: PrinterStatus;
  public status: string;
  public QuickControlView = QuickControlView;
  public view = QuickControlView.NONE;
  public hotendTarget: number;
  public heatbedTarget: number;
  public fanTarget: number;

  public constructor(
    private printerService: PrinterService,
    private configService: ConfigService
  ) {
    this.printerStatus = {
      nozzle: {
        current: 0,
        set: 0,
      },
      heatbed: {
        current: 0,
        set: 0,
      },
      fan: 0,
    };
    this.status = "connecting";
    this.hotendTarget = this.configService.getDefaultHotendTemperature();
    this.heatbedTarget = this.configService.getDefaultHeatbedTemperature();
    this.fanTarget = this.configService.getDefaultFanSpeed();
  }

  public ngOnInit(): void {
    this.subscriptions.add(
      this.printerService.getObservable().subscribe((printerStatus: PrinterStatusAPI): void => {
        this.printerStatus.nozzle = printerStatus.nozzle;
        this.printerStatus.heatbed = printerStatus.heatbed;
        this.status = printerStatus.status;
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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

  private showQuickControl(): void {
    setTimeout((): void => {
      const controlViewDOM = document.getElementById("quickControl");
      controlViewDOM.style.opacity = "1";
    }, 50);
  }

  public hideQuickControl(): void {
    const controlViewDOM = document.getElementById("quickControl");
    controlViewDOM.style.opacity = "0";
    setTimeout((): void => {
      this.view = QuickControlView.NONE;
    }, 500);
  }

  public quickControlChangeValue(value: number): void {
    switch (this.view) {
      case QuickControlView.HOTEND:
        this.changeTemperatureHotend(value);
        break;
      case QuickControlView.HEATBED:
        this.changeTemperatureHeatbed(value);
        break;
      case QuickControlView.FAN:
        this.changeSpeedFan(value);
        break;
    }
  }

  public quickControlSetValue(): void {
    switch (this.view) {
      case QuickControlView.HOTEND:
        this.setTemperatureHotend();
        break;
      case QuickControlView.HEATBED:
        this.setTemperatureHeatbed();
        break;
      case QuickControlView.FAN:
        this.setFanSpeed();
        break;
    }
  }

  private changeTemperatureHotend(value: number): void {
    this.hotendTarget += value;
    if (this.hotendTarget < -999) {
      this.hotendTarget = this.configService.getDefaultHotendTemperature();
    } else if (this.hotendTarget < 0) {
      this.hotendTarget = 0;
    } else if (this.hotendTarget > 999) {
      this.hotendTarget = 999;
    }
  }

  private changeTemperatureHeatbed(value: number): void {
    this.heatbedTarget += value;
    if (this.heatbedTarget < -999) {
      this.heatbedTarget = this.configService.getDefaultHeatbedTemperature();
    } else if (this.heatbedTarget < 0) {
      this.heatbedTarget = 0;
    } else if (this.heatbedTarget > 999) {
      this.heatbedTarget = 999;
    }
  }

  private changeSpeedFan(value: number): void {
    this.fanTarget += value;
    if (this.fanTarget < -999) {
      this.fanTarget = this.configService.getDefaultFanSpeed();
    } else if (this.fanTarget < 0) {
      this.fanTarget = 0;
    } else if (this.fanTarget > 100) {
      this.fanTarget = 100;
    }
  }

  private setTemperatureHotend(): void {
    this.printerService.setTemperatureHotend(this.hotendTarget);
    this.hideQuickControl();
  }

  private setTemperatureHeatbed(): void {
    this.printerService.setTemperatureHeatbed(this.heatbedTarget);
    this.hideQuickControl();
  }

  private setFanSpeed(): void {
    this.printerService.setFanSpeed(this.fanTarget);
    this.hideQuickControl();
  }
}

export interface PrinterStatus {
  nozzle: PrinterValue;
  heatbed: PrinterValue;
  fan: number | string;
}

enum QuickControlView {
  NONE,
  HOTEND,
  HEATBED,
  FAN,
}
