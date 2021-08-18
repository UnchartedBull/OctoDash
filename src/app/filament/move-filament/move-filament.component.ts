import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { ConfigService } from '../../config/config.service';
import { FilamentSpool } from '../../model';
import { PrinterService } from '../../services/printer/printer.service';

@Component({
  selector: 'app-filament-move-filament',
  templateUrl: './move-filament.component.html',
  styleUrls: ['./move-filament.component.scss', '../filament.component.scss'],
})
export class MoveFilamentComponent implements OnInit, OnDestroy {
  @Input() currentSpool: FilamentSpool;
  @Input() selectedSpool: FilamentSpool;
  @Input() action: 'load' | 'unload';

  @Output() increasePage = new EventEmitter<void>();

  public feedSpeed: number;
  public loadingMessage: string = $localize`:@@loading-filament:loading`;
  public unloadingMessage: string = $localize`:@@unloading-filament:unloading`;
  private fastMoveTimeout: ReturnType<typeof setTimeout>;
  private slowMoveTimeout: ReturnType<typeof setTimeout>;

  constructor(private configService: ConfigService, private printerService: PrinterService) {}

  ngOnInit(): void {
    if (this.getFeedLength() > 0) {
      this.feedSpeed = this.configService.getFeedSpeed();
      if (this.action === 'unload') {
        this.unloadSpool();
      } else {
        this.loadSpool();
      }
    } else {
      setTimeout(() => {
        this.increasePage.emit();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.fastMoveTimeout);
    clearTimeout(this.slowMoveTimeout);
  }

  public getInitialProgressBarWidth(): number {
    return this.action === 'unload' ? 100 : 0;
  }

  private getFeedLength(): number {
    return this.configService.useM600() ? 0 : this.configService.getFeedLength();
    // return 0;
  }

  private unloadSpool(): void {
    this.printerService.extrude(this.getFeedLength() * -1, this.configService.getFeedSpeed());
    setTimeout((): void => {
      const unloadingProgressBar = document.getElementById('filamentMoveBar');
      const unloadTime = this.getFeedLength() / this.configService.getFeedSpeed() + 0.5;
      unloadingProgressBar.style.backgroundColor = this.currentSpool ? this.currentSpool.color : '#4bae50';
      unloadingProgressBar.style.transition = 'width ' + unloadTime + 's ease-in';
      setTimeout((): void => {
        unloadingProgressBar.style.width = '0vw';
        this.fastMoveTimeout = setTimeout((): void => {
          this.increasePage.emit();
        }, unloadTime * 1000 + 500);
      }, 200);
    }, 0);
  }

  private loadSpool(): void {
    const loadTimeFast = (this.getFeedLength() * 0.75) / this.configService.getFeedSpeed();
    const loadTimeSlow = (this.getFeedLength() * 0.17) / this.configService.getFeedSpeedSlow();
    const loadTime = loadTimeFast + loadTimeSlow + 0.5;
    this.printerService.extrude(this.getFeedLength() * 0.75, this.configService.getFeedSpeed());
    setTimeout((): void => {
      const loadingProgressBar = document.getElementById('filamentMoveBar');
      loadingProgressBar.style.backgroundColor = this.selectedSpool ? this.selectedSpool.color : '#4bae50';
      loadingProgressBar.style.transition = 'width ' + loadTime + 's ease-in';
      setTimeout((): void => {
        loadingProgressBar.style.width = '50vw';
        this.fastMoveTimeout = setTimeout((): void => {
          this.printerService.extrude(this.getFeedLength() * 0.17, this.configService.getFeedSpeedSlow());
          this.feedSpeed = this.configService.getFeedSpeedSlow();
          this.slowMoveTimeout = setTimeout((): void => {
            this.increasePage.emit();
          }, loadTimeSlow * 1000 + 400);
        }, loadTimeFast * 1000 + 200);
      }, 200);
    }, 0);
  }

  public stopExtruderMovement(): void {
    this.printerService.emergencyStop();
    clearTimeout(this.fastMoveTimeout);
    clearTimeout(this.slowMoveTimeout);

    const bar = document.getElementById('filamentMoveBar');
    const wrapper = document.getElementsByClassName(
      'move-filament__progress-bar-wrapper',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    )[0] as any as HTMLElement;

    bar.style.width = Math.floor(bar.getBoundingClientRect().width) + 'px';
    wrapper.style.borderColor = '#c23616';
  }
}
