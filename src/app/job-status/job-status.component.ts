import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AppService } from '../app.service';
import { ConfigService } from '../config/config.service';
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
    private jobService: JobService,
    private service: AppService,
    private notificationService: NotificationService,
    private configService: ConfigService,
  ) {}

  public ngOnInit(): void {
    this.subscriptions.add(this.jobService.getObservable().subscribe((job: Job): Job => (this.job = job)));
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public isFileLoaded(): boolean {
    return this.service.getLoadedFile();
  }

  public isPreheatEnabled(): boolean {
    return this.configService.isPreheatPluginEnabled();
  }

  public preheat(): void {
    this.jobService.preheat();
  }

  public preheatDisabled(): void {
    this.notificationService.setWarning(
      'Preheat Plugin is not enabled!',
      'Please make sure to install and enable the Preheat Plugin to use this functionality.',
    );
  }

  public discardLoadedFile(): void {
    this.service.setLoadedFile(false);
  }

  public startJob(): void {
    this.jobService.startJob();
    setTimeout((): void => {
      this.service.setLoadedFile(false);
    }, 5000);
  }

  public isPrinting(): boolean {
    return this.jobService.isPrinting();
  }

  public showPreview(): boolean {
    return this.jobService.showPreviewWhilePrinting();
  }

  public hasProperty(object: Record<string, unknown>, name: string): boolean {
    return Object.hasOwnProperty.bind(object)(name);
  }
}
