import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { ZHeightLayer } from '../model';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-height-progress',
  templateUrl: './height-progress.component.html',
  styleUrls: ['./height-progress.component.scss'],
})
export class HeightProgressComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public height: number | ZHeightLayer;

  public constructor(private socketService: SocketService) {}

  public ngOnInit(): void {
    this.subscriptions.add(
      this.socketService.getJobStatusSubscribable().subscribe(jobStatus => {
        this.height = jobStatus.zHeight;
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public isNumber(variable: number | ZHeightLayer): boolean {
    return typeof variable === 'number';
  }
}
