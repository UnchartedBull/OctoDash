import { HttpErrorResponse, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { interval } from 'rxjs';
import { NotificationType } from 'src/app/model';

import { TokenSuccess } from '../../../model/octoprint/auth.model';
import { NotificationService } from '../../../notification/notification.service';
import { OctoprintAuthenticationService } from './octoprint-authentication.service';

@Component({
  selector: 'app-config-setup-octoprint-authentication',
  templateUrl: './octoprint-authentication.component.html',
  styleUrls: ['./octoprint-authentication.component.scss', '../setup.component.scss'],
})
export class OctoprintAuthenticationComponent {
  @Input() octoprintURL: string;
  @Input() accessToken: string;

  @Output() increasePage = new EventEmitter<void>();
  @Output() accessTokenChange = new EventEmitter<string>();

  constructor(private authService: OctoprintAuthenticationService, private notificationService: NotificationService) {}

  public loginWithOctoprintUI(): void {
    this.authService.probeAuthSupport(this.octoprintURL).subscribe({
      next: (result: HttpResponseBase) => {
        if (result.status === 204) {
          this.sendLoginRequest();
        } else this.setAutologinWarning();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 0) {
          this.notificationService.setNotification({
            heading: $localize`:@@octoprint-connection-failed:Can't connect to OctoPrint!`,
            text: $localize`:@@octoprint-connection-failed-message:Check the URL/IP and make sure that your OctoPrint instance is reachable from this device.`,
            type: NotificationType.ERROR,
            time: new Date(),
          });
        } else this.setAutologinWarning();
      },
    });
  }

  private setAutologinWarning(): void {
    this.notificationService.setNotification({
      heading: $localize`:@@unsupported-autologin:Automatic login not supported!`,
      text: $localize`:@@manually-create-api-key:Please create the API Key manually and paste it in the bottom field.`,
      type: NotificationType.WARN,
      time: new Date(),
    });
  }

  private sendLoginRequest(): void {
    this.authService.startAuthProcess(this.octoprintURL).subscribe({
      next: (token: string) => {
        this.notificationService.setNotification({
          heading: $localize`:@@login-request-sent:Login request send!`,
          text: $localize`:@@login-request-sent-message:Please confirm the request via the popup in the OctoPrint WebUI.`,
          type: NotificationType.INFO,
          time: new Date(),
        });
        setTimeout(() => {
          this.notificationService.closeNotification();
        }, 10 * 1000);
        this.pollResult(token);
      },
      error: () => this.setAutologinWarning(),
    });
  }

  private pollResult(token: string): void {
    const pollInterval = interval(1000).subscribe(() => {
      this.authService.pollAuthProcessStatus(this.octoprintURL, token).subscribe({
        next: (result: HttpResponse<TokenSuccess>) => {
          if (result.status === 200) {
            pollInterval.unsubscribe();
            this.accessToken = result.body.api_key;
            this.accessTokenChange.emit(result.body.api_key);
            setTimeout(() => {
              this.increasePage.emit();
            }, 600);
          }
        },
        error: () => {
          this.setAutologinWarning();
          pollInterval.unsubscribe();
        },
      });
    });
  }
}
