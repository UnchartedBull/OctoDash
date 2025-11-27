import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';

import { Option } from '../quick-control/quick-control.component';

@Component({
  selector: 'app-base-quick-control',
  template: '',
  standalone: false,
})
export abstract class BaseQuickControlComponent {
  abstract unit: string;
  abstract defaultValue: number;
  abstract options$: Observable<Option[]>;
  @Input() hideSet = false;

  @Output() onBack = new EventEmitter<number>();

  abstract publishValue(value: number): void;

  onChange(value: number): void {
    this.publishValue(value);
    this.onBack.emit(value);
  }
}
