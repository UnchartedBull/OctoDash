import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnimationOptions } from 'ngx-lottie';
import { Subject } from 'rxjs';

import { AppService } from '../services/app.service';
import { ConfigService } from '../services/config.service';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit {
  public activated = false;
  public initialized = false;
  public status = $localize`:@@initializing:initializing`;
  public showConnectionHint = false;

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

  public hideActionCenterEvent = new Subject<void>();

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
    // if no API key found or invalid API key
    // go to login flow
    this.configService.getConfig().subscribe({
      complete: () => {
        this.connectWebsocket();
      },
      error: () => this.router.navigate(['/login']),
    });
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
        this.router.navigate(['/main-screen']);
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

  public showActionCenterIcon(): boolean {
    return this.configService.showActionCenterIcon();
  }

  public hideActionCenter(): void {
    this.hideActionCenterEvent.next();
  }
}
