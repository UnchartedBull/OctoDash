import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {RoundProgressModule, ROUND_PROGRESS_DEFAULTS} from 'angular-svg-round-progressbar';

import { AppComponent } from './app.component';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';
import { PrinterStatusComponent } from './printer-status/printer-status.component';
import { JobStatusComponent } from './job-status/job-status.component';

@NgModule({
  declarations: [
    AppComponent,
    BottomBarComponent,
    PrinterStatusComponent,
    JobStatusComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RoundProgressModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
