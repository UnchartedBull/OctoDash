import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-quick-control',
  templateUrl: './quick-control.component.html',
  styleUrls: ['./quick-control.component.scss'],
})
export class QuickControlComponent {
  @Input() settings;
  @Input() hide;
}