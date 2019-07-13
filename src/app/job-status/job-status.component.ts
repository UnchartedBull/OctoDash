import { Component, OnInit } from '@angular/core';
import { JobStatusService, Job } from './job-status.service';

@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss'],
  providers: [JobStatusService]
})
export class JobStatusComponent implements OnInit {
  job: Job;

  constructor(private jobStatusService: JobStatusService) { }

  ngOnInit() {
    this.jobStatusService.getObservable().subscribe((job: Job) => this.job = job);
  }
}
