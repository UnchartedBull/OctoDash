import { Component, OnInit } from '@angular/core';
import { JobService } from '../job.service';
import { PrinterService, PrinterStatusAPI } from '../printer.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-print-control',
  templateUrl: './print-control.component.html',
  styleUrls: ['./print-control.component.scss']
})
export class PrintControlComponent implements OnInit {

  public showControls = false;
  public controlView = ControlView;
  public view = ControlView.MAIN;

  public temperatureHotend;
  public temperatureHeatbed;
  public feedrate;
  public flowrate;

  constructor(private jobService: JobService, private printerService: PrinterService) { }

  ngOnInit() {
  }

  public cancel(event) {
    if (this.showControls) {
      this.stopPropagation(event);
      this.view = ControlView.CANCEL;
    }
  }

  public pause(event) {
    if (this.showControls) {
      this.stopPropagation(event);
      this.jobService.pauseJob();
      this.view = ControlView.PAUSE;
    }
  }

  public adjust(event) {
    if (this.showControls) {
      this.view = ControlView.ADJUST;
      this.stopPropagation(event);
    }
  }

  public stopPropagation(event) {
    if (this.showControls) {
      event.stopPropagation();
    }
  }

  public showControlOverlay(event?) {
    this.stopPropagation(event);
    this.loadData();
    this.view = ControlView.MAIN;
    this.showControls = true;
  }

  public hideControlOverlay(event) {
    this.stopPropagation(event);
    this.showControls = false;
  }

  public cancelPrint(event) {
    if (this.showControls && this.view === ControlView.CANCEL) {
      this.jobService.cancelJob();
      this.hideControlOverlay(event);
    }
  }

  public resume(event) {
    if (this.showControls && this.view === ControlView.PAUSE) {
      this.jobService.resumeJob();
      this.hideControlOverlay(event);
    }
  }

  public backToControlScreen(event) {
    this.view = ControlView.MAIN;
    this.stopPropagation(event);
  }

  private loadData() {
    this.temperatureHotend = '?';
    this.temperatureHeatbed = '?';
    this.flowrate = 100;
    this.feedrate = 100;
    this.printerService.getObservable().pipe(take(1)).subscribe((printerStatus: PrinterStatusAPI) => {
      this.temperatureHotend = printerStatus.nozzle.set;
      this.temperatureHeatbed = printerStatus.heatbed.set;
    });
  }

  public changeTemperatureHotend(value: number) {
    this.temperatureHotend += value;
    if (this.temperatureHotend < 0) { this.temperatureHotend = 0; }
    if (this.temperatureHotend > 999) { this.temperatureHotend = 999; }
  }

  public changeTemperatureHeatbed(value: number) {
    this.temperatureHeatbed += value;
    if (this.temperatureHeatbed < 0) { this.temperatureHeatbed = 0; }
    if (this.temperatureHeatbed > 999) { this.temperatureHeatbed = 999; }
  }

  public changeFeedrate(value: number) {
    this.feedrate += value;
    if (this.feedrate < 50) { this.feedrate = 50; }
    if (this.feedrate > 200) { this.feedrate = 200; }
  }

  public changeFlowrate(value: number) {
    this.flowrate += value;
    if (this.flowrate < 75) { this.flowrate = 75; }
    if (this.flowrate > 125) { this.flowrate = 125; }
  }

  public setAdjustParameters() {
    this.printerService.setTemperatureHotend(this.temperatureHotend);
    this.printerService.setTemperatureHeatbed(this.temperatureHeatbed);
    this.printerService.setFeedrate(this.feedrate);
    this.printerService.setFlowrate(this.flowrate);
  }

}


enum ControlView {
  MAIN,
  CANCEL,
  PAUSE,
  ADJUST
}
