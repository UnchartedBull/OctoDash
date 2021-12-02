import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { SocketService } from './services/socket/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public activated = false;
  public initialized = false;
  public status = $localize`:@@initializing:initializing`;
  public showConnectionHint = false;
  public notificationCenterTop = '-100%';
  public animateNotificationCenter = true;
  public startSwipe: Touch | undefined;

  public loadingOptionsCache: AnimationOptions = {
    path: 'assets/animations/loading.json',
  };
  public checkmarkOptionsCache: AnimationOptions = {
    path: 'assets/animations/checkmark.json',
  };
  public toggleSwitchOptionsCache: AnimationOptions = {
    path: 'assets/animations/toggle-switch.json',
  };
  public loadingAnimationCached = false;
  public checkmarkAnimationCached = false;
  public toggleSwitchAnimationCached = false;

  public constructor(
    private service: AppService,
    private configService: ConfigService,
    private socketService: SocketService,
    private router: Router,
  ) {}

  public ngOnInit(): void {
    this.initialize();
  }

  private initialize(): void {
    if (this.configService && this.configService.isInitialized()) {
      if (this.configService.isLoaded()) {
        if (this.configService.isValid()) {
          this.connectWebsocket();
        } else {
          this.checkInvalidConfig();
        }
      } else {
        this.router.navigate(['/no-config']);
      }
    } else {
      setTimeout(this.initialize.bind(this), 1000);
    }
  }

  private checkInvalidConfig() {
    const errors = this.configService.getErrors();

    if (this.service.hasUpdateError(errors)) {
      if (this.service.fixUpdateErrors(errors)) {
        setTimeout(this.initialize.bind(this), 1500);
      } else {
        this.configService.setUpdate();
        this.router.navigate(['/no-config']);
      }
    } else {
      this.router.navigate(['/invalid-config']);
    }
  }

  private connectWebsocket() {
    const showPrinterConnectedTimeout = setTimeout(() => {
      this.showConnectionHint = true;
    }, 30000);
    this.socketService
      .connect()
      .then(() => {
        if (this.configService.isTouchscreen()) {
          this.router.navigate(['/main-screen']);
        } else {
          this.router.navigate(['/main-screen-no-touch']);
        }
        this.initialized = true;
      })
      .finally(() => clearTimeout(showPrinterConnectedTimeout));
  }

  public loadingAnimationCacheDone(): void {
    this.loadingAnimationCached = true;
  }

  public checkmarkAnimationCacheDone(): void {
    this.checkmarkAnimationCached = true;
  }

  public showNotificationCenterIcon(): boolean {
    return this.configService.showNotificationCenterIcon();
  }

  public toggleSwitchAnimationCacheDone(): void {
    this.toggleSwitchAnimationCached = true;
  }

  public hideNotificationCenter() {
    this.notificationCenterTop = '-100%';
  }

  public showNotificationCenter() {
    this.notificationCenterTop = '0%';
  }

  public setNotificationCenterPosition(position: string) {
    this.notificationCenterTop = position;
  }

  public setNotificationCenterAnimation(enabled: boolean) {
    this.animateNotificationCenter = enabled;
  }

  public onTouchStart(event: TouchEvent) {
    if (event.changedTouches[0].clientY < event.view.innerHeight / 8) {
      this.startSwipe = event.changedTouches[0];
      this.animateNotificationCenter = false;
    } else {
      this.startSwipe = undefined;
    }
  }

  public onTouchMove(event: TouchEvent) {
    if (this.startSwipe) {
      this.notificationCenterTop = `${(100 - (event.changedTouches[0].clientY / event.view.innerHeight) * 100) * -1}%`;
    }
  }

  public onTouchEnd(event: TouchEvent) {
    if (this.startSwipe) {
      this.animateNotificationCenter = true;
      const endSwipe = event.changedTouches[0];
      if (endSwipe.clientY > event.view.innerHeight / 3) {
        this.showNotificationCenter();
      } else {
        this.hideNotificationCenter();
      }
    }
  }
}
