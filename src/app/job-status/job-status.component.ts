import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { AppService } from '../app.service';
import { Job, JobService } from '../job.service';

@Component({
    selector: 'app-job-status',
    templateUrl: './job-status.component.html',
    styleUrls: ['./job-status.component.scss'],
})
export class JobStatusComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription = new Subscription();
    public job: Job;

    public constructor(private jobService: JobService, private service: AppService) {}

    public ngOnInit(): void {
        this.subscriptions.add(this.jobService.getObservable().subscribe((job: Job): Job => (this.job = job)));
    }

    public ngOnDestroy(): void {
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
        setTimeout((): void => {
            this.service.setLoadedFile(false);
        }, 5000);
    }

    public isPrinting(): boolean {
        return this.jobService.isPrinting();
    }
}
