import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ControlComponent } from './components/control/control.component';
import { FilamentComponent } from './components/filament/filament.component';
import { FilesComponent } from './components/files/files.component';
import { MainScreenComponent } from './components/main-screen/main-screen.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ConfigInvalidComponent } from './components/setup/invalid-config/invalid-config.component';
import { ConfigSetupComponent } from './components/setup/setup.component';
import { StandbyComponent } from './components/standby/standby.component';

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
