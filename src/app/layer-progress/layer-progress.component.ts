import { Component, OnInit } from '@angular/core';
import { DisplayLayerProgressService, LayerProgress } from '../display-layer-progress.service';

@Component({
  selector: 'app-layer-progress',
  templateUrl: './layer-progress.component.html',
  styleUrls: ['./layer-progress.component.scss']
})
export class LayerProgressComponent implements OnInit {

  layerProgress: LayerProgress

  constructor(private _displayLayerProgressService: DisplayLayerProgressService) {
    this._displayLayerProgressService.getObservable().subscribe((layerProgress: LayerProgress) => this.layerProgress = layerProgress);
  }

  ngOnInit() {
  }

}
