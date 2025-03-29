import { Component, inject } from '@angular/core';

import { ConfigSchema } from '../../model/config.model';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-login-screen',
  templateUrl: './login-screen.component.html',
  styleUrl: './login-screen.component.scss',
  standalone: false,
})
export class LoginScreenComponent {
  public config: ConfigSchema;
  public accessToken: string;

  public configService = inject(ConfigService);

  ngOnInit(): void {
    this.config = this.configService.getCurrentConfig();
    this.accessToken = this.configService.getAccessToken();
  }
  public onAccessTokenChange(event: string): void {
    this.configService.setAccessToken(event);
  }
  public submit() {
    this.configService.setAccessToken(this.accessToken);
    window.location.reload();
  }
}
