import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RoundProgressModule, ROUND_PROGRESS_DEFAULTS } from 'angular-svg-round-progressbar';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { PrinterStatusComponent } from './printer-status/printer-status.component';
import { JobStatusComponent } from './job-status/job-status.component';
import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { LayerProgressComponent } from './layer-progress/layer-progress.component';
import { InvalidConfigComponent } from './config/invalid-config/invalid-config.component';
import { NoConfigComponent } from './config/no-config/no-config.component';
import { PrintControlComponent } from './print-control/print-control.component';
import { ErrorComponent } from './error/error.component';
import { ErrorService } from './error/error.service';
import { PrinterService } from './printer.service';
import { MainMenuComponent } from './main-menu/main-menu.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { ControlComponent } from './control/control.component';
import { AppRoutingModule } from './app.routing.module';
import { MainScreenComponent } from './main-screen/main-screen.component';
import { MainScreenNoTouchComponent } from './main-screen/no-touch/main-screen-no-touch.component';
import { JobService } from './job.service';
import { FilamentComponent } from './filament/filament.component';
import { FilesComponent } from './files/files.component';
import { URLSafePipe } from './url.pipe';


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
    URLSafePipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RoundProgressModule,
    FormsModule,
    FontAwesomeModule
  ],
  providers: [AppService, ConfigService, ErrorService, PrinterService, JobService],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
    library.add(fas);
  }
}
