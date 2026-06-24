import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-hotend-icon',
  templateUrl: './hotend-icon.component.html',
  styleUrls: ['./hotend-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class HotendIconComponent {
  @Input() tool: number;
}
