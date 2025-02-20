import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-config-setup-welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss', '../setup.component.scss'],
    standalone: false
})
export class WelcomeComponent {
  @Input() update: boolean;
}
