import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { FilesService } from '../files.service';
import { Job, JobService } from '../job.service';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss'],
})
export class JobStatusComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public job: Job;

  public constructor(
    private _jobService: JobService,
    private _fileService: FilesService,
    private _notificationService: NotificationService,
    private _configService: ConfigService,
  ) {}

  public ngOnInit(): void {
    this.subscriptions.add(this._jobService.getObservable().subscribe((job: Job): Job => (this.job = job)));
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public isFileLoaded(): boolean {
    return this._fileService.loadedFile;
  }

  public isPreheatEnabled(): boolean {
    return this._configService.isPreheatPluginEnabled();
  }

  public preheat(): void {
    this._jobService.preheat();
  }

  public preheatDisabled(): void {
    this._notificationService.setWarning(
      'Preheat Plugin is not enabled!',
      'Please make sure to install and enable the Preheat Plugin to use this functionality.',
    );
  }

  public discardLoadedFile(): void {
    this._fileService.loadedFile = false;
  }

  public startJob(): void {
    this._jobService.startJob();
    setTimeout((): void => {
      this._fileService.loadedFile = false;
    }, 5000);
  }

  public isPrinting(): boolean {
    return this._jobService.isPrinting();
  }

  public showPreview(): boolean {
    return this._jobService.showPreviewWhilePrinting();
  }

  public hasProperty(object: Record<string, unknown>, name: string): boolean {
    return Object.hasOwnProperty.bind(object)(name);
  }

  public useCircularProgressBar(): boolean {
    return this._configService.getPreviewProgressCircle();
  }
}
