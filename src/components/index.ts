import { AppComponent } from './app.component';
import { BottomBarComponent } from './main-screen/bottom-bar/bottom-bar.component';
import { ControlComponent } from './control/control.component';
import { CustomActionsComponent } from './control/custom-actions/custom-actions.component';
import { ChangeFilamentComponent } from './filament/change-filament/change-filament.component';
import { ChooseFilamentComponent } from './filament/choose-filament/choose-filament.component';
import { ChooseToolComponent } from './filament/choose-tool/choose-tool.component';
import { FilamentComponent } from './filament/filament.component';
import { HeatNozzleComponent } from './filament/heat-nozzle/heat-nozzle.component';
import { MoveFilamentComponent } from './filament/move-filament/move-filament.component';
import { PurgeFilamentComponent } from './filament/purge-filament/purge-filament.component';
import { FilesComponent } from './files/files.component';
import { HeightProgressComponent } from './main-screen/job-status/height-progress/height-progress.component';
import { JobStatusComponent } from './main-screen/job-status/job-status.component';
import { MainMenuComponent } from './main-screen/main-menu/main-menu.component';
import { MainScreenComponent } from './main-screen/main-screen.component';
import { PrinterStatusComponent } from './main-screen/printer-status/printer-status.component';
import { NotificationComponent } from './notification/notification.component';
import { PrintControlComponent } from './main-screen/print-control/print-control.component';
import { ResetComponent } from './reset/reset.component';
import { SettingsComponent } from './settings/settings.component';
import { SettingsIconComponent } from './settings/settings-icon/settings-icon.component';
import { DiscoverOctoprintComponent } from './setup/discover-octoprint/discover-octoprint.component';
import { ExtruderInformationComponent } from './setup/extruder-information/extruder-information.component';
import { ConfigInvalidComponent } from './setup/invalid-config/invalid-config.component';
import { OctoprintAuthenticationComponent } from './setup/octoprint-authentication/octoprint-authentication.component';
import { PersonalizationComponent } from './setup/personalization/personalization.component';
import { PluginsComponent } from './setup/plugins/plugins.component';
import { ConfigSetupComponent } from './setup/setup.component';
import { WelcomeComponent } from './setup/welcome/welcome.component';
import { ToggleSwitchComponent } from './shared/toggle-switch/toggle-switch.component';
import { StandbyComponent } from './standby/standby.component';
import { UpdateComponent } from './update/update.component';
import { TopBarComponent } from './shared/top-bar/top-bar.component';

export default [
  AppComponent,
  BottomBarComponent,
  ChooseFilamentComponent,
  ChooseToolComponent,
  ConfigInvalidComponent,
  ConfigSetupComponent,
  ControlComponent,
  DiscoverOctoprintComponent,
  ExtruderInformationComponent,
  FilamentComponent,
  FilesComponent,
  JobStatusComponent,
  HeightProgressComponent,
  MainMenuComponent,
  MainScreenComponent,
  NotificationComponent,
  OctoprintAuthenticationComponent,
  PersonalizationComponent,
  PluginsComponent,
  PrintControlComponent,
  PrinterStatusComponent,
  SettingsComponent,
  SettingsIconComponent,
  StandbyComponent,
  UpdateComponent,
  ResetComponent,
  WelcomeComponent,
  HeatNozzleComponent,
  MoveFilamentComponent,
  ChangeFilamentComponent,
  PurgeFilamentComponent,
  CustomActionsComponent,
  ToggleSwitchComponent,
  TopBarComponent,
];
