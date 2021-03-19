import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { EventService } from '../event.service';
import { JobStatus } from '../model';
import { FilesService } from '../services/files/files.service';
import { JobService } from '../services/job/job.service';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss'],
})
export class JobStatusComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  public jobStatus: JobStatus;
  public thumbnail: string;
  public showPreviewWhilePrinting: boolean;

  public constructor(
    private jobService: JobService,
    private fileService: FilesService,
    private socketService: SocketService,
    private eventService: EventService,
    private configService: ConfigService,
  ) {
    this.showPreviewWhilePrinting = this.configService.showThumbnailByDefault();
  }

  public ngOnInit(): void {
    this.subscriptions.add(
      this.socketService.getJobStatusSubscribable().subscribe((jobStatus: JobStatus): void => {
        if (jobStatus.file !== this.jobStatus?.file) {
          this.fileService.getThumbnail(jobStatus.fullPath).subscribe(thumbnail => {
            this.thumbnail = thumbnail;
          });
        }
        this.jobStatus = jobStatus;
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public isFileLoaded(): boolean {
    return this.fileService.getLoadedFile();
  }

  public isPreheatEnabled(): boolean {
    return this.configService.isPreheatPluginEnabled();
  }

  public preheat(): void {
    this.jobService.preheat();
  }

  public discardLoadedFile(): void {
    this.fileService.setLoadedFile(false);
  }

  public startJob(): void {
    this.jobService.startJob();
    setTimeout((): void => {
      this.fileService.setLoadedFile(false);
    }, 5000);
  }

  public isPrinting(): boolean {
    return this.eventService.isPrinting();
  }

  public togglePreview(): void {
    this.showPreviewWhilePrinting = !this.showPreviewWhilePrinting;
  }

  public hasProperty(object: Record<string, unknown>, name: string): boolean {
    return Object.hasOwnProperty.bind(object)(name);
  }

  public useCircularProgressBar(): boolean {
    return this.configService.getPreviewProgressCircle();
  }
}
