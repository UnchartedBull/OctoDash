import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-config-setup-extruder-information',
  templateUrl: './extruder-information.component.html',
  styleUrls: ['./extruder-information.component.scss', '../setup.component.scss'],
})
export class ExtruderInformationComponent {
  @Input() feedLength: number;
  @Input() feedSpeed: number;

  @Output() feedLengthChange = new EventEmitter<number>();
  @Output() feedSpeedChange = new EventEmitter<number>();

  changeFeedLength(amount: number): void {
    if (this.feedLength + amount < 0) {
      this.feedLength = 0;
    } else if (this.feedLength + amount > 9999) {
      this.feedLength = 9999;
    } else {
      this.feedLength += amount;
    }
    this.feedLengthChange.emit(this.feedLength);
  }

  changeFeedSpeed(amount: number): void {
    if (this.feedSpeed + amount < 0) {
      this.feedSpeed = 0;
    } else if (this.feedSpeed + amount > 999) {
      this.feedSpeed = 999;
    } else {
      this.feedSpeed += amount;
    }
    this.feedSpeedChange.emit(this.feedSpeed);
  }
}
