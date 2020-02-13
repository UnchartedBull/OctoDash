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
}

export interface PrinterStatus {
    nozzle: PrinterValue;
    heatbed: PrinterValue;
    fan: number | string;
}
