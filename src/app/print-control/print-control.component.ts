import { Component } from '@angular/core';
import { take } from 'rxjs/operators';

import { JobService } from '../job.service';
import { PrinterService, PrinterStatusAPI } from '../printer.service';

@Component({
    selector: 'app-print-control',
    templateUrl: './print-control.component.html',
    styleUrls: ['./print-control.component.scss'],
})
export class PrintControlComponent {
    public showControls = false;
    public controlView = ControlView;
    public view = ControlView.MAIN;

    public temperatureHotend: number;
    public temperatureHeatbed: number;
    public feedrate: number;
    public flowrate: number;

    public constructor(private jobService: JobService, private printerService: PrinterService) {
        this.temperatureHotend = 0;
        this.temperatureHeatbed = 0;
        this.flowrate = 100;
        this.feedrate = 100;
    }

    public isClickOnPreview(event: MouseEvent): boolean {
        const previewSwitchMin = window.innerWidth * 0.08;
        const previewSwitchMax = window.innerWidth * 0.25;

        return (
            previewSwitchMin < event.clientX &&
            event.clientX < previewSwitchMax &&
            previewSwitchMin < event.clientY &&
            event.clientY < previewSwitchMax
        );
    }

    public cancel(event: MouseEvent): void {
        if (this.showControls) {
            this.stopPropagation(event);
            this.view = ControlView.CANCEL;
        }
    }

    public pause(event: MouseEvent): void {
        if (this.showControls) {
            this.stopPropagation(event);
            this.jobService.pauseJob();
            this.view = ControlView.PAUSE;
        }
    }

    public adjust(event: MouseEvent): void {
        if (this.showControls) {
            this.view = ControlView.ADJUST;
            this.stopPropagation(event);
        }
    }

    public stopPropagation(event: MouseEvent): void {
        if (this.showControls) {
            event.stopPropagation();
        }
    }

    public showControlOverlay(event?: MouseEvent): void {
        if (!this.isClickOnPreview(event) && !this.showControls) {
            this.stopPropagation(event);
            this.loadData();
            this.view = ControlView.MAIN;
            this.showControls = true;
        } else {
            this.jobService.togglePreviewWhilePrinting();
        }
    }

    public hideControlOverlay(event: MouseEvent): void {
        this.stopPropagation(event);
        this.showControls = false;
    }

    public cancelPrint(event: MouseEvent): void {
        if (this.showControls && this.view === ControlView.CANCEL) {
            this.jobService.cancelJob();
            this.hideControlOverlay(event);
        }
    }

    public resume(event: MouseEvent): void {
        if (this.showControls && this.view === ControlView.PAUSE) {
            this.jobService.resumeJob();
            this.hideControlOverlay(event);
        }
    }

    public backToControlScreen(event: MouseEvent): void {
        if (this.showControls) {
            this.view = ControlView.MAIN;
            this.stopPropagation(event);
        }
    }

    private loadData(): void {
        this.printerService
            .getObservable()
            .pipe(take(1))
            .subscribe((printerStatus: PrinterStatusAPI): void => {
                this.temperatureHotend = printerStatus.nozzle.set;
                this.temperatureHeatbed = printerStatus.heatbed.set;
            });
    }

    public changeTemperatureHotend(value: number): void {
        if (this.showControls) {
            this.temperatureHotend += value;
            if (this.temperatureHotend < 0) {
                this.temperatureHotend = 0;
            }
            if (this.temperatureHotend > 999) {
                this.temperatureHotend = 999;
            }
        }
    }

    public changeTemperatureHeatbed(value: number): void {
        if (this.showControls) {
            this.temperatureHeatbed += value;
            if (this.temperatureHeatbed < 0) {
                this.temperatureHeatbed = 0;
            }
            if (this.temperatureHeatbed > 999) {
                this.temperatureHeatbed = 999;
            }
        }
    }

    public changeFeedrate(value: number): void {
        if (this.showControls) {
            this.feedrate += value;
            if (this.feedrate < 50) {
                this.feedrate = 50;
            }
            if (this.feedrate > 200) {
                this.feedrate = 200;
            }
        }
    }

    public changeFlowrate(value: number): void {
        if (this.showControls) {
            this.flowrate += value;
            if (this.flowrate < 75) {
                this.flowrate = 75;
            }
            if (this.flowrate > 125) {
                this.flowrate = 125;
            }
        }
    }

    public setAdjustParameters(event: MouseEvent): void {
        if (this.showControls) {
            this.printerService.setTemperatureHotend(this.temperatureHotend);
            this.printerService.setTemperatureHeatbed(this.temperatureHeatbed);
            this.printerService.setFeedrate(this.feedrate);
            this.printerService.setFlowrate(this.flowrate);
            this.hideControlOverlay(event);
        }
    }
}

enum ControlView {
    MAIN,
    CANCEL,
    PAUSE,
    ADJUST,
}
