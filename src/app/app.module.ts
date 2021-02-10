import { HttpClient, HttpClientModule } from '@angular/common/http';
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
import { CustomActionsComponent } from './control/custom-actions/custom-actions.component';
import { ChangeFilamentComponent } from './filament/change-filament/change-filament.component';
import { ChooseFilamentComponent } from './filament/choose-filament/choose-filament.component';
import { FilamentComponent } from './filament/filament.component';
import { HeatNozzleComponent } from './filament/heat-nozzle/heat-nozzle.component';
import { MoveFilamentComponent } from './filament/move-filament/move-filament.component';
import { PurgeFilamentComponent } from './filament/purge-filament/purge-filament.component';
import { FilesService } from './files.service';
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
import { FilamentManagerOctoprintService, FilamentPluginService } from './plugins';
import { PrintControlComponent } from './print-control/print-control.component';
import { PrinterService } from './printer.service';
import { PrinterStatusComponent } from './printer-status/printer-status.component';
import { AuthService } from './services/auth/octoprint.auth.service';
import { OctoPrintSocketService } from './services/socket/socket.octoprint.service';
import { SocketService } from './services/socket/socket.service';
import { SettingsComponent } from './settings/settings.component';
import { StandbyComponent } from './standby/standby.component';
import { UpdateComponent } from './update/update.component';
import { URLSafePipe } from './url.pipe';

@NgModule({
  declarations: [
    AppComponent,
    BottomBarComponent,
    ChooseFilamentComponent,
    ConfigInvalidComponent,
    ConfigSetupComponent,
    ControlComponent,
    DiscoverOctoprintComponent,
    ExtruderInformationComponent,
    FilamentComponent,
    FilesComponent,
    JobStatusComponent,
    LayerProgressComponent,
    LongPress,
    MainMenuComponent,
    MainScreenComponent,
    MainScreenNoTouchComponent,
    NotificationComponent,
    OctoprintAuthenticationComponent,
    PersonalizationComponent,
    PluginsComponent,
    PrintControlComponent,
    PrinterStatusComponent,
    SettingsComponent,
    StandbyComponent,
    UpdateComponent,
    URLSafePipe,
    WelcomeComponent,
    HeatNozzleComponent,
    MoveFilamentComponent,
    ChangeFilamentComponent,
    PurgeFilamentComponent,
    CustomActionsComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    MatRippleModule,
    NgxElectronModule,
    NgxSpinnerModule,
    RoundProgressModule,
  ],
  providers: [
    AppService,
    AuthService,
    ConfigService,
    NotificationService,
    PrinterService,
    JobService,
    FilesService,
    [
      {
        provide: SocketService,
        deps: [ConfigService, AuthService],
        useFactory: (configService: ConfigService, authService: AuthService) => {
          return new OctoPrintSocketService(configService, authService);
        },
      },
    ],
    [
      {
        provide: FilamentPluginService,
        deps: [ConfigService, HttpClient],
        useFactory: (configService: ConfigService, httpClient: HttpClient) => {
          return new FilamentManagerOctoprintService(configService, httpClient);
        },
      },
    ],
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
  public constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
