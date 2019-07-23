import { Component, OnInit } from '@angular/core';
import { JobService } from '../job.service';

@Component({
  selector: 'app-print-control',
  templateUrl: './print-control.component.html',
  styleUrls: ['./print-control.component.scss']
})
export class PrintControlComponent implements OnInit {

  // FIXME: Change before release
  public showControls = true;
  public controlView = ControlView;
  public view = ControlView.PAUSE;

  constructor(private jobService: JobService) { }

  ngOnInit() {
  }

  public cancel(event) {
    this.stopPropagation(event);
    this.view = ControlView.CANCEL;
  }

  public pause(event) {
    this.stopPropagation(event);
    this.jobService.pauseJob();
    this.view = ControlView.PAUSE;
  }

  public adjust(event) {
    this.stopPropagation(event);
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
    this.jobService.cancelJob();
    this.hideControlOverlay(event);
  }

  public resume(event) {
    this.jobService.resumeJob();
    this.hideControlOverlay(event);
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
