import { Component, OnInit, OnDestroy } from '@angular/core';
import { LayerProgressService, DisplayLayerProgressAPI } from './layer-progress.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-layer-progress',
  templateUrl: './layer-progress.component.html',
  styleUrls: ['./layer-progress.component.scss']
})
export class LayerProgressComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();
  public layerProgress: LayerProgress;

  constructor(private displayLayerProgressService: LayerProgressService) {
    this.layerProgress = {
      current: 0,
      total: 0
    };
  }

  ngOnInit() {
    this.subscriptions.add(this.displayLayerProgressService.getObservable().subscribe((layerProgress: DisplayLayerProgressAPI) => {
      this.layerProgress.current = layerProgress.current;
      this.layerProgress.total = layerProgress.total;
    }));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}

export interface LayerProgress {
  current: number;
  total: number;
}
