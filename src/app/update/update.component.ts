import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';

import { AppService } from '../app.service';
import { ElectronService } from '../electron.service';
import { NotificationType, UpdateDownloadProgress, UpdateError } from '../model';
import { NotificationService } from '../notification/notification.service';
import { SystemService } from '../services/system/system.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
  standalone: false,
})
export class UpdateComponent implements OnInit {
  @Output() closeFunction = new EventEmitter<void>(true);

  public updateProgress: UpdateDownloadProgress = {
    percentage: 0,
    transferred: 0,
    total: '--.-',
    remaining: 0,
    eta: '--:--',
    runtime: '--:--',
    delta: 0,
    speed: '--.-',
  };
  public page = 1;

  constructor(
    public service: AppService,
    private notificationService: NotificationService,
    private systemService: SystemService,
    private zone: NgZone,
    private electronService: ElectronService,
  ) {}

  ngOnInit(): void {
    if (!this.service.getLatestVersion() || !this.service.getLatestVersionAssetsURL()) {
      this.notificationService.setNotification({
        heading: $localize`:@@error-update:Can't initiate update!`,
        text: $localize`:@@error-update-message:Some information is missing, please try again in an hour or update manually.`,
        type: NotificationType.ERROR,
        time: new Date(),
      });
      this.closeUpdateWindow();
    } else {
      this.setupListeners();
      this.update(this.service.getLatestVersionAssetsURL());
    }
  }

  private setupListeners(): void {
    this.electronService.on('updateError', (_, updateError: UpdateError): void => {
      this.notificationService.setNotification({
        heading: $localize`:@@error-install-update:Can't install update!`,
        text: updateError.error.message,
        type: NotificationType.ERROR,
        time: new Date(),
      });
      this.closeUpdateWindow();
    });

    this.electronService.on('updateDownloadProgress', (_, updateDownloadProgress: UpdateDownloadProgress): void => {
      this.zone.run(() => {
        this.updateProgress = updateDownloadProgress;
      });
    });

    this.electronService.on('updateDownloadFinished', (): void => {
      this.zone.run(() => {
        this.page = 2;
      });
    });

    this.electronService.on('updateInstalled', (): void => {
      this.zone.run(() => {
        this.page = 3;
      });
    });
  }

  public closeUpdateWindow(): void {
    this.page = 1;
    this.closeFunction.emit();
  }

  private update(assetsURL: string): void {
    this.electronService.send('update', {
      assetsURL: assetsURL,
    });
  }

  public restart(): void {
    this.electronService.send('restart');
  }
}
