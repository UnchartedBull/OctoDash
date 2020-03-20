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
    public newHotendTarget = 200;
    public newHeatbedTarget = 60;

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

    public hideQuickControl(): void {
        this.view = QuickControlView.NONE;
    }

    public changeTemperatureHotend(value: number): void {
        this.newHotendTarget += value;
        if (this.newHotendTarget < 0) {
            this.newHotendTarget = 0;
        }
        if (this.newHotendTarget > 999) {
            this.newHotendTarget = 999;
        }
    }

    public changeTemperatureHeatbed(value: number): void {
        this.newHeatbedTarget += value;
        if (this.newHeatbedTarget < 0) {
            this.newHeatbedTarget = 0;
        }
        if (this.newHeatbedTarget > 999) {
            this.newHeatbedTarget = 999;
        }
    }

    public setTemperatureHotend(): void {
        this.printerService.setTemperatureHotend(this.newHotendTarget);
        this.view = QuickControlView.NONE;
    }

    public setTemperatureHeatbed(): void {
        this.printerService.setTemperatureHeatbed(this.newHeatbedTarget);
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
}
