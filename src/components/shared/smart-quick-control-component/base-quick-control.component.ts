import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { map, Observable, of } from 'rxjs';

import { Option } from '../quick-control/quick-control.component';

@Component({
  selector: 'app-base-quick-control',
  template: '',
  standalone: false,
})
export abstract class BaseQuickControlComponent implements OnInit {
  abstract unit: string;
  abstract defaultValue: number;
  abstract options$: Observable<Option[]>;

  filteredOptions$: Observable<Option[]> = of([]);

  ngOnInit() {
    this.filteredOptions$ = this.options$.pipe(
      map(options =>
        options.filter(option => {
          if (!this.hideOff) {
            return true;
          }
          return option.value !== 0;
        }),
      ),
      map(options =>
        options.map(option => ({
          ...option,
          value: option.value + this.tempOffset,
        })),
      ),
    );
    this.onChange.emit(this.defaultValue);
  }

  @Input() hideSet = false;
  @Input() hideOff = false;
  @Input() tempOffset = 0;

  @Output() onSet = new EventEmitter<number>();
  @Output() onChange = new EventEmitter<number>();

  abstract publishValue(value: number): void;

  handleChange(value: number): void {
    this.onChange.emit(value);
  }

  handleSet(value: number): void {
    this.publishValue(value);
    this.onSet.emit(value);
  }
}
