import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-quick-control',
  templateUrl: './quick-control.component.html',
  styleUrls: ['./quick-control.component.scss'],
  standalone: false,
})
export class QuickControlComponent implements OnInit {
  @Input() icon: string;
  @Input() unit: string;
  @Input() defaultValue: number;

  @Output() onBack = new EventEmitter<void>();
  @Output() onSet = new EventEmitter<number>();

  public value: number;

  public ngOnInit() {
    this.value = this.defaultValue;
  }

  public changeValue(value: number): void {
    this.value += value;
    if (this.value < -999) {
      this.value = this.defaultValue;
    } else if (this.value < 0) {
      this.value = 0;
    } else if (this.value > 999) {
      this.value = 999;
    }
  }

  public setValue(): void {
    this.onSet.emit(this.value);
  }
}
