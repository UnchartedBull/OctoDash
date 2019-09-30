import { Component, OnInit, OnDestroy } from '@angular/core';
import { JobService, Job } from '../job.service';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
import { ErrorService } from '../error/error.service';

@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss']
})
export class JobStatusComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  public job: Job;

  constructor(private jobService: JobService, private service: AppService, private errorService: ErrorService) { }

  ngOnInit() {
    this.subscriptions.add(this.jobService.getObservable().subscribe((job: Job) => this.job = job));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public isFileLoaded(): boolean {
    return this.service.getLoadedFile();
  }

  public preheat(): void {
    this.errorService.setError('Operation not yet supported', 'sorry about that one ... will come in the future!');
  }

  public cancelLoadedFile(): void {
    this.service.setLoadedFile(false);
  }
}
