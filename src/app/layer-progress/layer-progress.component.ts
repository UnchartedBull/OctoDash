import { Component, OnInit } from '@angular/core';
import { DisplayLayerProgressService, DisplayLayerProgressAPI } from '../display-layer-progress.service';

@Component({
  selector: 'app-layer-progress',
  templateUrl: './layer-progress.component.html',
  styleUrls: ['./layer-progress.component.scss']
})
export class LayerProgressComponent implements OnInit {

  layerProgress: LayerProgress

  constructor(private _displayLayerProgressService: DisplayLayerProgressService) {
    this.layerProgress = {
      current: 0,
      total: 0
    }
    this._displayLayerProgressService.getObservable().subscribe((layerProgress: DisplayLayerProgressAPI) => {
      this.layerProgress.current = layerProgress.current;
      this.layerProgress.total = layerProgress.total;
    });
  }

  ngOnInit() {
  }

}

export interface LayerProgress {
  current: number;
  total: number;
}