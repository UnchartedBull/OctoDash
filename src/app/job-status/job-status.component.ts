import { Component, OnInit, OnDestroy } from '@angular/core';
import { JobService, Job } from '../job.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss'],
  providers: [JobService]
})
export class JobStatusComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  public job: Job;

  constructor(private jobService: JobService) { }

  ngOnInit() {
    this.subscriptions.add(this.jobService.getObservable().subscribe((job: Job) => this.job = job));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
