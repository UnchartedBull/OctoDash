import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { JobService, Job } from '../job.service';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss']
})

export class MainScreenComponent implements OnInit, OnDestroy {

  public printing = false;
  private subscriptions: Subscription = new Subscription();


  constructor(private jobService: JobService) {
  }

  ngOnInit() {
    this.subscriptions.add(this.jobService.getObservable().subscribe((job: Job) => this.printing = job !== null));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
