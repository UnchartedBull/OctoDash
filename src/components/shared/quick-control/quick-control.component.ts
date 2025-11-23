import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface Option {
  value: number;
  label: string;
}

@Component({
  selector: 'app-quick-control',
  templateUrl: './quick-control.component.html',
  styleUrls: ['./quick-control.component.scss'],
  standalone: false,
})
export class QuickControlComponent implements OnInit {
  @Input() unit: string;
  @Input() defaultValue: number;

  @Output() onBack = new EventEmitter<void>();
  @Output() onSet = new EventEmitter<number>();

  public value: number;

  // Options for the quick control
  // If null, a loading state is shown
  @Input() public options: Option[] | null;

  public ngOnInit() {
    this.value = this.defaultValue;
  }

  public changeValueDelta(value: number): void {
    this.value += value;
    if (this.value < -999) {
      this.value = this.defaultValue;
    } else if (this.value < 0) {
      this.value = 0;
    } else if (this.value > 999) {
      this.value = 999;
    }
  }

  public changeValue(value: number): void {
    this.value = value;
  }

  public setValue(): void {
    this.onSet.emit(this.value);
  }
}
