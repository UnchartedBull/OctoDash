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
    );
  }

  @Input() hideSet = false;
  @Input() hideOff = false;

  @Output() onBack = new EventEmitter<number>();

  abstract publishValue(value: number): void;

  onChange(value: number): void {
    if (this.hideSet) {
      this.publishValue(value);
    }
  }

  onSet(value: number): void {
    this.publishValue(value);
    this.onBack.emit(value);
  }
}
