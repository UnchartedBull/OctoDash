import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatRippleModule } from "@angular/material/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FaIconLibrary, FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { RoundProgressModule } from "angular-svg-round-progressbar";
import { NgxSpinnerModule } from "ngx-spinner";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app.routing.module";
import { AppService } from "./app.service";
import { BottomBarComponent } from "./bottom-bar/bottom-bar.component";
import { ConfigService } from "./config/config.service";
import { InvalidConfigComponent } from "./config/invalid-config/invalid-config.component";
import { NoConfigComponent } from "./config/no-config/no-config.component";
import { ControlComponent } from "./control/control.component";
import { FilamentComponent } from "./filament/filament.component";
import { FilesComponent } from "./files/files.component";
import { JobStatusComponent } from "./job-status/job-status.component";
import { JobService } from "./job.service";
import { MainMenuComponent } from "./main-menu/main-menu.component";
import { MainScreenComponent } from "./main-screen/main-screen.component";
import { MainScreenNoTouchComponent } from "./main-screen/no-touch/main-screen-no-touch.component";
import { NotificationComponent } from "./notification/notification.component";
import { NotificationService } from "./notification/notification.service";
import { PrintControlComponent } from "./print-control/print-control.component";
import { PrinterStatusComponent } from "./printer-status/printer-status.component";
import { PrinterService } from "./printer.service";
import { SettingsComponent } from "./settings/settings.component";
import { StandbyComponent } from "./standby/standby.component";
import { UpdateComponent } from "./update/update.component";
import { URLSafePipe } from "./url.pipe";

@NgModule({
  declarations: [
    AppComponent,
    BottomBarComponent,
    PrinterStatusComponent,
    JobStatusComponent,
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
    StandbyComponent,
    UpdateComponent,
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
    MatRippleModule,
  ],
  providers: [AppService, ConfigService, NotificationService, PrinterService, JobService],
  bootstrap: [AppComponent],
})
export class AppModule {
  public constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
