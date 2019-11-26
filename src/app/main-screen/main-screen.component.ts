import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { JobService, Job } from '../job.service';
import { AppService } from '../app.service';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
  selector: 'app-main-screen',
  templateUrl: './main-screen.component.html',
  styleUrls: ['./main-screen.component.scss']
})

export class MainScreenComponent {

  public printing = false;


  constructor(private jobService: JobService, private service: AppService) {
  }

  public isPrinting() {
    return this.jobService.isPrinting();
  }

  public isFileLoaded(): boolean {
    return this.service.getLoadedFile();
  }
}
