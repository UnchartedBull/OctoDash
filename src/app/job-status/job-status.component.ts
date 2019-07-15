import { Component, OnInit, OnDestroy } from '@angular/core';
import { JobStatusService, Job } from './job-status.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss'],
  providers: [JobStatusService]
})
export class JobStatusComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  public job: Job;

  constructor(private jobStatusService: JobStatusService) { }

  ngOnInit() {
    this.subscriptions.add(this.jobStatusService.getObservable().subscribe((job: Job) => this.job = job));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
