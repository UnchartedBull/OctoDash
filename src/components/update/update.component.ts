import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';

import { UpdateDownloadProgress } from '../../model';
import { AppService } from '../../services/app.service';
import { NotificationService } from '../../services/notification.service';
import { SystemService } from '../../services/system/system.service';

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
  ) {}

  ngOnInit(): void {
    if (!this.service.getLatestVersion() || !this.service.getLatestVersionAssetsURL()) {
      this.notificationService.error(
        $localize`:@@error-update:Can't initiate update!`,
        $localize`:@@error-update-message:Some information is missing, please try again in an hour or update manually.`,
      );
      this.closeUpdateWindow();
    } else {
      this.setupListeners();
      this.update(this.service.getLatestVersionAssetsURL());
    }
  }

  private setupListeners(): void {}

  public closeUpdateWindow(): void {
    this.page = 1;
    this.closeFunction.emit();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private update(assetsURL: string): void {}

  public restart(): void {}
}
