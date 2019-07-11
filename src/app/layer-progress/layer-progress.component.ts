import { Component, OnInit } from '@angular/core';
import { LayerProgress, JobStatusService } from '../job-status.service';

@Component({
  selector: 'app-layer-progress',
  templateUrl: './layer-progress.component.html',
  styleUrls: ['./layer-progress.component.scss']
})
export class LayerProgressComponent implements OnInit {

  layerProgress: LayerProgress

  constructor(private _jobStatusService: JobStatusService) {
    this._jobStatusService.getLayerProgressObservable().subscribe((layerProgress: LayerProgress) => this.layerProgress = layerProgress);
  }

  ngOnInit() {
  }

}
