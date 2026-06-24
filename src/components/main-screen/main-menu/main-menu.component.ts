import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false,
})
export class MainMenuComponent implements OnDestroy {
  public now = Date.now();
  public interval;

  public constructor() {
    this.interval = setInterval(() => (this.now = Date.now()), 1000);
  }

  public ngOnDestroy(): void {
    clearInterval(this.interval);
  }
}
