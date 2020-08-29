import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DisplayLayerProgressAPI, LayerProgressService } from '../plugin-service/layer-progress.service';

@Component({
  selector: 'app-layer-progress',
  templateUrl: './layer-progress.component.html',
  styleUrls: ['./layer-progress.component.scss'],
})
export class LayerProgressComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  public layerProgress: LayerProgress;

  public constructor(private displayLayerProgressService: LayerProgressService) {
    this.layerProgress = {
      current: 0,
      total: 0,
    };
  }

  public ngOnInit(): void {
    this.subscriptions.add(
      this.displayLayerProgressService.getObservable().subscribe((layerProgress: DisplayLayerProgressAPI): void => {
        this.layerProgress.current = layerProgress.current;
        this.layerProgress.total = layerProgress.total;
      }),
    );
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

export interface LayerProgress {
  current: number;
  total: number;
}
