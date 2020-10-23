import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import _ from 'lodash';
import { ElectronService } from 'ngx-electron';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';
import { OctoprintScriptService } from './octoprint-script.service';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    require: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public constructor(
    private service: AppService,
    private configService: ConfigService,
    private octoprintScriptService: OctoprintScriptService,
    private notificationService: NotificationService,
    private router: Router,
    private electronService: ElectronService,
    private changeDetector: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  public activated = false;
  public status = 'connecting';

  public ngOnInit(): void {
    this.initialize();
  }

  private initialize(): void {
    if (!this.electronService.isElectronApp) {
      this.notificationService.setWarning(
        'Non electron environment detected!',
        'The app may not work as intended. If you run an official build please open a new issue on GitHub.',
      );
    }
    if (this.configService && this.configService.isInitialized()) {
      if (this.configService.isLoaded()) {
        if (this.configService.isValid()) {
          this.waitForOctoprint();
        } else {
          this.checkInvalidConfig();
        }
      } else {
        this.router.navigate(['/no-config']);
      }
    } else {
      setTimeout(this.initialize.bind(this), 1000);
    }
  }

  private checkInvalidConfig() {
    if (_.isEqual(this.configService.getErrors(), this.service.getUpdateError())) {
      if (this.service.autoFixError()) {
        this.initialize();
      } else {
        this.configService.setUpdate();
        this.router.navigate(['/no-config']);
      }
    } else {
      this.router.navigate(['/invalid-config']);
    }
  }

  private waitForOctoprint() {
    this.electronService.ipcRenderer.on('octoprintReady', (_, octoprintReady: boolean) => {
      if (octoprintReady) {
        this.initializeOctoprintService();
        this.status = 'initializing';
      } else {
        this.notificationService
          .setWarning(
            'Connection to OctoPrint timed out!',
            'Make sure that OctoPrint is up and running, then close this card to try again.',
          )
          .then(this.checkOctoprintPort.bind(this));
        this.status = 'no connection';
      }
      this.changeDetector.detectChanges();
    });

    this.electronService.ipcRenderer.on('waitPortError', (_, error: Error) => {
      this.notificationService.setError('System Error - please restart', error.message);
    });

    this.checkOctoprintPort();
  }

  private checkOctoprintPort() {
    this.status = 'connecting';
    const urlNoProtocol = this.configService.getURL('').split('//')[1];
    this.electronService.ipcRenderer.send('checkOctoprintPort', {
      host: urlNoProtocol.split(':')[0],
      port: Number(urlNoProtocol.split(':')[1].split('/')[0]),
    });
    this.changeDetector.detectChanges();
  }

  private initializeOctoprintService() {
    this.octoprintScriptService
      .initialize(this.configService.getURL(''))
      .then(() => {
        this.octoprintScriptService.authenticate(this.configService.getAccessKey());
        this.ngZone.run(() => {
          if (this.configService.isTouchscreen()) {
            this.router.navigate(['/main-screen']);
          } else {
            this.router.navigate(['/main-screen-no-touch']);
          }
        });
      })
      .catch(() => {
        this.notificationService.setError(
          "Can't get OctoPrint script!",
          'Please restart your machine. If the error persists open a new issue on GitHub.',
        );
      });
  }
}
