import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hotend-icon',
  templateUrl: './hotend-icon.component.html',
  styleUrls: ['./hotend-icon.component.scss'],
  standalone: false,
})
export class HotendIconComponent {
  @Input() tool: number;
}
