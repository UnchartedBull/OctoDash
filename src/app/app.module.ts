import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgxElectronModule } from 'ngx-electron';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { AppService } from './app.service';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { ConfigService } from './config/config.service';
import { ConfigInvalidComponent } from './config/invalid/invalid.component';
import { DiscoverOctoprintComponent } from './config/setup/discover-octoprint/discover-octoprint.component';
import { ExtruderInformationComponent } from './config/setup/extruder-information/extruder-information.component';
import { OctoprintAuthenticationComponent } from './config/setup/octoprint-authentication/octoprint-authentication.component';
import { PersonalizationComponent } from './config/setup/personalization/personalization.component';
import { PluginsComponent } from './config/setup/plugins/plugins.component';
import { ConfigSetupComponent } from './config/setup/setup.component';
import { WelcomeComponent } from './config/setup/welcome/welcome.component';
import { ControlComponent } from './control/control.component';
import { FilamentComponent } from './filament/filament.component';
import { FilesComponent } from './files/files.component';
import { JobService } from './job.service';
import { JobStatusComponent } from './job-status/job-status.component';
import { LayerProgressComponent } from './layer-progress/layer-progress.component';
import { LongPress } from './long-press.directive';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MainScreenComponent } from './main-screen/main-screen.component';
import { MainScreenNoTouchComponent } from './main-screen/no-touch/main-screen-no-touch.component';
import { NotificationComponent } from './notification/notification.component';
import { NotificationService } from './notification/notification.service';
import { PrintControlComponent } from './print-control/print-control.component';
import { PrinterService } from './printer.service';
import { PrinterStatusComponent } from './printer-status/printer-status.component';
import { SettingsComponent } from './settings/settings.component';
import { StandbyComponent } from './standby/standby.component';
import { UpdateComponent } from './update/update.component';
import { URLSafePipe } from './url.pipe';

@NgModule({
  declarations: [
    AppComponent,
    BottomBarComponent,
    ControlComponent,
    FilamentComponent,
    FilesComponent,
    ConfigInvalidComponent,
    JobStatusComponent,
    LayerProgressComponent,
    LongPress,
    MainMenuComponent,
    MainScreenComponent,
    MainScreenNoTouchComponent,
    ConfigSetupComponent,
    NotificationComponent,
    PrintControlComponent,
    PrinterStatusComponent,
    SettingsComponent,
    StandbyComponent,
    UpdateComponent,
    URLSafePipe,
    WelcomeComponent,
    DiscoverOctoprintComponent,
    OctoprintAuthenticationComponent,
    PersonalizationComponent,
    ExtruderInformationComponent,
    PluginsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    RoundProgressModule,
    FormsModule,
    FontAwesomeModule,
    NgxElectronModule,
    NgxSpinnerModule,
    BrowserAnimationsModule,
    MatRippleModule,
  ],
  providers: [AppService, ConfigService, NotificationService, PrinterService, JobService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  public constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
