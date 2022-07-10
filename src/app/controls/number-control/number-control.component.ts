import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-number-control',
  templateUrl: './number-control.component.html',
  styleUrls: ['./number-control.component.scss'],
})
export class NumberControlComponent {
  @Input() value: number;
  @Input() label: string;
  @Input() id: string;
  @Input() required: boolean;
  @Input() width: 'small' | 'medium' | 'large';
  @Input() min: number;
  @Input() max: number;

  @Output() valueChange = new EventEmitter<number>();

  changeValue(amount: number): void {
    if (this.value + amount < this.min) {
      this.value = this.min;
    } else if (this.value + amount > this.max) {
      this.value = this.max;
    } else {
      this.value += amount;
    }
    this.valueChange.emit(this.value);
  }
}
