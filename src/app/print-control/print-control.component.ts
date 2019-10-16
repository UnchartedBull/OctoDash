import { Component, OnInit } from '@angular/core';
import { JobService } from '../job.service';

@Component({
  selector: 'app-print-control',
  templateUrl: './print-control.component.html',
  styleUrls: ['./print-control.component.scss']
})
export class PrintControlComponent implements OnInit {

  // FIXME
  public showControls = true;
  public controlView = ControlView;
  public view = ControlView.ADJUST;

  constructor(private jobService: JobService) { }

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

}


enum ControlView {
  MAIN,
  CANCEL,
  PAUSE,
  ADJUST
}
