import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Injectable } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { ControlComponent } from './control/control.component';
import { FilamentComponent } from './filament/filament.component';
import { FilesComponent } from './files/files.component';
import { InvalidConfigComponent } from './config/invalid-config/invalid-config.component';
import { JobStatusComponent } from './job-status/job-status.component';
import { LayerProgressComponent } from './layer-progress/layer-progress.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MainScreenComponent } from './main-screen/main-screen.component';
import { MainScreenNoTouchComponent } from './main-screen/no-touch/main-screen-no-touch.component';
import { NoConfigComponent } from './config/no-config/no-config.component';
import { NotificationComponent } from './notification/notification.component';
import { PrintControlComponent } from './print-control/print-control.component';
import { PrinterStatusComponent } from './printer-status/printer-status.component';
import { SettingsComponent } from './settings/settings.component';
import { StandbyComponent } from './standby/standby.component';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';
import { JobService } from './job.service';
import { PrinterService } from './printer.service';

import { URLSafePipe } from './url.pipe';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';

import * as Hammer from 'hammerjs';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

export class MyHammerConfig extends HammerGestureConfig {
  overrides = {
    press: { pointers: 1, time: 501, threshold: 15 },
    swipe: { pointers: 1, direction: Hammer.DIRECTION_LEFT, threshold: 20, velocity: 0.4 }
  } as any;
}

@Injectable()
export class HammerConfig extends HammerGestureConfig {
  overrides = {
    pan: {
      direction: 6
    },
    pinch: {
      enable: false
    },
    rotate: {
      enable: false
    },
    press: {
      pointers: 1, time: 501, threshold: 15
    },
    swipe: {
      pointers: 1, direction: Hammer.DIRECTION_LEFT, threshold: 20, velocity: 0.4
    }
  };
}

@NgModule({
  declarations: [
    AppComponent,
    BottomBarComponent,
    PrinterStatusComponent,
    JobStatusComponent,
    LayerProgressComponent,
    InvalidConfigComponent,
    NoConfigComponent,
    PrintControlComponent,
    NotificationComponent,
    MainMenuComponent,
    ControlComponent,
    MainScreenComponent,
    MainScreenNoTouchComponent,
    FilamentComponent,
    FilesComponent,
    SettingsComponent,
    URLSafePipe,
    StandbyComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RoundProgressModule,
    FormsModule,
    FontAwesomeModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    MatRippleModule
  ],
  providers: [
    AppService,
    ConfigService,
    NotificationService,
    PrinterService,
    JobService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
