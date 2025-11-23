import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-value-picker-modal',
  templateUrl: './value-picker-modal.component.html',
  styleUrls: ['./value-picker-modal.component.scss'],
  standalone: false,
})
export class ValuePickerModalComponent {
  @Input() icon: string;
  @Output() onBack = new EventEmitter<void>();
}
