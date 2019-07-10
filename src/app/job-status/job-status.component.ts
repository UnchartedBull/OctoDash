import { Component, OnInit } from '@angular/core';
import { JobStatusService, Job } from '../job-status.service';

@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss'],
  providers: [JobStatusService]
})
export class JobStatusComponent implements OnInit {
  job: Job;

  constructor(private _jobStatusService: JobStatusService) { }

  ngOnInit() {
    this._jobStatusService.getJobInformationObservable().subscribe((job: Job) => this.job = job);
  }
}