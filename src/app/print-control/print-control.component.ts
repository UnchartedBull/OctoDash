import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-print-control',
  templateUrl: './print-control.component.html',
  styleUrls: ['./print-control.component.scss']
})
export class PrintControlComponent implements OnInit {

  // FIXME: Change before release
  public showControls = true;

  constructor() { }

  ngOnInit() {
  }

  cancel(event) {
    this.stopPropagation(event);
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

}
