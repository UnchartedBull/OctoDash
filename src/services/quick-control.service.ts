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
  view = QuickControlView.NONE;
  selectedHotend = 0;

  public getIconForView(): string {
    switch (this.view) {
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

  public isVisible(): boolean {
    return this.view !== QuickControlView.NONE;
  }

  public showQuickControlHotend(tool: number): void {
    this.view = QuickControlView.HOTEND;
    this.selectedHotend = tool;
  }

  public showQuickControlHeatbed(): void {
    this.view = QuickControlView.HEATBED;
  }

  public showQuickControlFan(): void {
    this.view = QuickControlView.FAN;
  }

  public hideQuickControl(): void {
    this.view = QuickControlView.NONE;
  }
}
