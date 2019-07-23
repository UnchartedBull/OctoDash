import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from './config/config.service';
import { JobService, Job } from './job.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  public printing = false;

  constructor(public configService: ConfigService, private jobService: JobService) {
  }

  ngOnInit() {
    // FIXME: Adds second subscription
    if (this.configService.valid && this.configService.config.octodash.touchscreen) {
      this.subscriptions.add(this.jobService.getObservable().subscribe((job: Job) => this.printing = job !== null));
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
