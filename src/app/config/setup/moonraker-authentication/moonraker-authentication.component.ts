import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-config-setup-moonraker-authentication',
  templateUrl: './moonraker-authentication.component.html',
  styleUrls: ['./moonraker-authentication.component.scss', '../setup.component.scss'],
})
export class MoonrakerAuthenticationComponent {
  @Input() accessToken: string;

  @Output() increasePage = new EventEmitter<void>();
  @Output() accessTokenChange = new EventEmitter<string>();
}
