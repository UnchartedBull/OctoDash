import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-config-setup-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss', '../setup.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class WelcomeComponent {
  @Input() update: boolean;
}
