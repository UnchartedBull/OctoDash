import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RoundProgressModule, ROUND_PROGRESS_DEFAULTS } from 'angular-svg-round-progressbar';

import { AppRoutingModule } from './app.routing.module';

import { AppComponent } from './app.component';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { ControlComponent } from './control/control.component';
import { ErrorComponent } from './error/error.component';
import { FilamentComponent } from './filament/filament.component';
import { FilesComponent } from './files/files.component';
import { InvalidConfigComponent } from './config/invalid-config/invalid-config.component';
import { JobStatusComponent } from './job-status/job-status.component';
import { LayerProgressComponent } from './layer-progress/layer-progress.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MainScreenComponent } from './main-screen/main-screen.component';
import { MainScreenNoTouchComponent } from './main-screen/no-touch/main-screen-no-touch.component';
import { NoConfigComponent } from './config/no-config/no-config.component';
import { PrintControlComponent } from './print-control/print-control.component';
import { PrinterStatusComponent } from './printer-status/printer-status.component';

import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { ErrorService } from './error/error.service';
import { JobService } from './job.service';
import { PrinterService } from './printer.service';

import { URLSafePipe } from './url.pipe';

import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';


import * as Hammer from 'hammerjs';
import { SettingsComponent } from './settings/settings.component';

export class MyHammerConfig extends HammerGestureConfig {
  overrides = {
    press: { pointers: 1, time: 501, threshold: 15 },
    swipe: { pointers: 1, direction: Hammer.DIRECTION_LEFT, threshold: 20, velocity: 0.4 }
  } as any;
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
    ErrorComponent,
    MainMenuComponent,
    ControlComponent,
    MainScreenComponent,
    MainScreenNoTouchComponent,
    FilamentComponent,
    FilesComponent,
    SettingsComponent,
    URLSafePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RoundProgressModule,
    FormsModule,
    FontAwesomeModule,
    NgxSpinnerModule,
  ],
  providers: [
    AppService,
    ConfigService,
    ErrorService,
    PrinterService,
    JobService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
