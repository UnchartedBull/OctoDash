import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-input-control',
  templateUrl: './input-control.component.html',
  styleUrls: ['./input-control.component.scss'],
})
export class InputControlComponent {
  @Input() value: string;
  @Input() label: string;
  @Input() id: string;
  @Input() required: boolean;
  @Input() width: 'small' | 'medium' | 'large';

  @Output() valueChange = new EventEmitter<string>();
}
