import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-print-control',
  templateUrl: './print-control.component.html',
  styleUrls: ['./print-control.component.scss']
})
export class PrintControlComponent implements OnInit {

  // FIXME: Change before release
  public showControls = false;
  public controlView = ControlView;
  public view = ControlView.MAIN;

  constructor() { }

  ngOnInit() {
  }

  cancel(event) {
    this.stopPropagation(event);
    this.view = ControlView.CANCEL;
  }

  pause(event) {
    this.stopPropagation(event);
  }

  adjust(event) {
    this.stopPropagation(event);
  }

  stopPropagation(event) {
    if (this.showControls) {
      event.stopPropagation();
    }
  }

  toggleControls() {
    if (!this.showControls) {
      this.view = ControlView.MAIN;
    }
    this.showControls = !this.showControls;
  }

  cancelPrint() {
    console.log("Cancelling print");
  }

  backToControlScreen(event) {
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
