import { Injectable } from '@angular/core';

export enum QuickControlView {
  NONE,
  HOTEND,
  HEATBED,
  FAN,
}

@Injectable({
  providedIn: 'root',
})
export class QuickControlService {
  public getIconForView(view: QuickControlView): string {
    switch (view) {
      case QuickControlView.HOTEND:
        return 'assets/nozzle.svg';
      case QuickControlView.HEATBED:
        return 'assets/heat-bed.svg';
      case QuickControlView.FAN:
        return 'assets/fan.svg';
      default:
        return '';
    }
  }
}
