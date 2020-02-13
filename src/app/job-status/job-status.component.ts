import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AppService } from '../app.service';
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

    constructor(private jobService: JobService, private service: AppService) {}

    ngOnInit() {
        this.subscriptions.add(this.jobService.getObservable().subscribe((job: Job) => (this.job = job)));
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    public isFileLoaded(): boolean {
        return this.service.getLoadedFile();
    }

    public preheat(): void {
        this.jobService.preheat();
    }

    public cancelLoadedFile(): void {
        this.service.setLoadedFile(false);
    }

    public startJob(): void {
        this.jobService.startJob();
        setTimeout(() => {
            this.service.setLoadedFile(false);
        }, 5000);
    }

    public isPrinting(): boolean {
        return this.jobService.isPrinting();
    }
}
