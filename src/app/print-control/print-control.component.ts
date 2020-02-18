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

    public temperatureHotend;
    public temperatureHeatbed;
    public feedrate;
    public flowrate;

    public constructor(private jobService: JobService, private printerService: PrinterService) {}

    public cancel(event): void {
        if (this.showControls) {
            this.stopPropagation(event);
            this.view = ControlView.CANCEL;
        }
    }

    public pause(event): void {
        if (this.showControls) {
            this.stopPropagation(event);
            this.jobService.pauseJob();
            this.view = ControlView.PAUSE;
        }
    }

    public adjust(event): void {
        if (this.showControls) {
            this.view = ControlView.ADJUST;
            this.stopPropagation(event);
        }
    }

    public stopPropagation(event): void {
        if (this.showControls) {
            event.stopPropagation();
        }
    }

    public showControlOverlay(event?): void {
        this.stopPropagation(event);
        this.loadData();
        this.view = ControlView.MAIN;
        this.showControls = true;
    }

    public hideControlOverlay(event): void {
        this.stopPropagation(event);
        this.showControls = false;
    }

    public cancelPrint(event): void {
        if (this.showControls && this.view === ControlView.CANCEL) {
            this.jobService.cancelJob();
            this.hideControlOverlay(event);
        }
    }

    public resume(event): void {
        if (this.showControls && this.view === ControlView.PAUSE) {
            this.jobService.resumeJob();
            this.hideControlOverlay(event);
        }
    }

    public backToControlScreen(event): void {
        this.view = ControlView.MAIN;
        this.stopPropagation(event);
    }

    private loadData(): void {
        this.temperatureHotend = '?';
        this.temperatureHeatbed = '?';
        this.flowrate = 100;
        this.feedrate = 100;
        this.printerService
            .getObservable()
            .pipe(take(1))
            .subscribe((printerStatus: PrinterStatusAPI): void => {
                this.temperatureHotend = printerStatus.nozzle.set;
                this.temperatureHeatbed = printerStatus.heatbed.set;
            });
    }

    public changeTemperatureHotend(value: number): void {
        this.temperatureHotend += value;
        if (this.temperatureHotend < 0) {
            this.temperatureHotend = 0;
        }
        if (this.temperatureHotend > 999) {
            this.temperatureHotend = 999;
        }
    }

    public changeTemperatureHeatbed(value: number): void {
        this.temperatureHeatbed += value;
        if (this.temperatureHeatbed < 0) {
            this.temperatureHeatbed = 0;
        }
        if (this.temperatureHeatbed > 999) {
            this.temperatureHeatbed = 999;
        }
    }

    public changeFeedrate(value: number): void {
        this.feedrate += value;
        if (this.feedrate < 50) {
            this.feedrate = 50;
        }
        if (this.feedrate > 200) {
            this.feedrate = 200;
        }
    }

    public changeFlowrate(value: number): void {
        this.flowrate += value;
        if (this.flowrate < 75) {
            this.flowrate = 75;
        }
        if (this.flowrate > 125) {
            this.flowrate = 125;
        }
    }

    public setAdjustParameters(event): void {
        this.printerService.setTemperatureHotend(this.temperatureHotend);
        this.printerService.setTemperatureHeatbed(this.temperatureHeatbed);
        this.printerService.setFeedrate(this.feedrate);
        this.printerService.setFlowrate(this.flowrate);
        this.hideControlOverlay(event);
    }
}

enum ControlView {
    MAIN,
    CANCEL,
    PAUSE,
    ADJUST,
}
