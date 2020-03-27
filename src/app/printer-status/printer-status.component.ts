import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DisplayLayerProgressAPI, LayerProgressService } from '../plugin-service/layer-progress.service';
import { PrinterService, PrinterStatusAPI, PrinterValue } from '../printer.service';

@Component({
    selector: 'app-printer-status',
    templateUrl: './printer-status.component.html',
    styleUrls: ['./printer-status.component.scss'],
})
export class PrinterStatusComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription = new Subscription();
    public printerStatus: PrinterStatus;
    public status: string;
    public QuickControlView = QuickControlView;
    public view = QuickControlView.NONE;
    public hotendTarget = 200;
    public heatbedTarget = 60;
    public fanTarget = 100;

    public constructor(
        private printerService: PrinterService,
        private displayLayerProgressService: LayerProgressService,
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
        this.status = 'connecting';
    }

    public ngOnInit(): void {
        this.subscriptions.add(
            this.printerService.getObservable().subscribe((printerStatus: PrinterStatusAPI): void => {
                this.printerStatus.nozzle = printerStatus.nozzle;
                this.printerStatus.heatbed = printerStatus.heatbed;
                this.status = printerStatus.status;
            }),
        );

        this.subscriptions.add(
            this.displayLayerProgressService
                .getObservable()
                .subscribe((layerProgress: DisplayLayerProgressAPI): void => {
                    this.printerStatus.fan = layerProgress.fanSpeed;
                }),
        );
    }

    public ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    public showQuickControlHotend(): void {
        this.view = QuickControlView.HOTEND;
    }

    public showQuickControlHeatbed(): void {
        this.view = QuickControlView.HEATBED;
    }

    public showQuickControlFan(): void {
        this.view = QuickControlView.FAN;
    }

    public hideQuickControl(): void {
        this.view = QuickControlView.NONE;
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
        if (this.hotendTarget < 0) {
            this.hotendTarget = 0;
        }
        if (this.hotendTarget > 999) {
            this.hotendTarget = 999;
        }
    }

    private changeTemperatureHeatbed(value: number): void {
        this.heatbedTarget += value;
        if (this.heatbedTarget < 0) {
            this.heatbedTarget = 0;
        }
        if (this.heatbedTarget > 999) {
            this.heatbedTarget = 999;
        }
    }

    private changeSpeedFan(value: number): void {
        this.fanTarget += value;
        if (this.fanTarget < 0) {
            this.fanTarget = 0;
        }
        if (this.fanTarget > 100) {
            this.fanTarget = 100;
        }
    }

    private setTemperatureHotend(): void {
        this.printerService.setTemperatureHotend(this.hotendTarget);
        this.view = QuickControlView.NONE;
    }

    private setTemperatureHeatbed(): void {
        this.printerService.setTemperatureHeatbed(this.heatbedTarget);
        this.view = QuickControlView.NONE;
    }

    private setFanSpeed(): void {
        this.printerService.setFanSpeed(this.fanTarget);
        this.view = QuickControlView.NONE;
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
