import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfigInvalidComponent } from './config/invalid/invalid.component';
import { ConfigSetupComponent } from './config/setup/setup.component';
import { ControlComponent } from './control/control.component';
import { FilamentComponent } from './filament/filament.component';
import { FilesComponent } from './files/files.component';
import { MainScreenComponent } from './main-screen/main-screen.component';
import { SettingsComponent } from './settings/settings.component';
import { StandbyComponent } from './standby/standby.component';

const routes: Routes = [
  {
    path: 'main-screen',
    component: MainScreenComponent,
  },
  {
    path: 'control',
    component: ControlComponent,
  },
  {
    path: 'filament',
    component: FilamentComponent,
  },
  {
    path: 'files',
    component: FilesComponent,
  },
  {
    path: 'invalid-config',
    component: ConfigInvalidComponent,
  },
  {
    path: 'no-config',
    component: ConfigSetupComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'standby',
    component: StandbyComponent,
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes, { useHash: true, enableViewTransitions: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
