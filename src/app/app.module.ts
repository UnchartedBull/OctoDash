import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatRippleModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import lottiePlayer from 'lottie-web';
import { LottieComponent, provideCacheableAnimationLoader, provideLottieOptions } from 'ngx-lottie';

import components from './components';
import { AppComponent } from './components/app.component';
import { AppRoutingModule } from './app.routing.module';
import { AppService } from './services/app.service';
import { ConfigService } from './services/config.service';
import { ConversionService } from './services/conversion.service';
import { EventService } from './services/event.service';
import { LongPress } from './long-press.directive';
import { NotificationService } from './services/notification.service';
import { EnclosureOctoprintService } from './services/enclosure/enclosure.octoprint.service';
import { EnclosureService } from './services/enclosure/enclosure.service';
import { FilamentManagerOctoprintService } from './services/filament/filament-manager.octoprint.service';
import { FilamentPluginService } from './services/filament/filament-plugin.service';
import { SpoolManagerOctoprintService } from './services/filament/spool-manager.octoprint.service';
import { FilesOctoprintService } from './services/files/files.octoprint.service';
import { FilesService } from './services/files/files.service';
import { JobOctoprintService } from './services/job/job.octoprint.service';
import { JobService } from './services/job/job.service';
import { PrinterOctoprintService } from './services/printer/printer.octoprint.service';
import { PrinterService } from './services/printer/printer.service';
import { OctoPrintSocketService } from './services/socket/socket.octoprint.service';
import { SocketService } from './services/socket/socket.service';
import { SystemOctoprintService } from './services/system/system.octoprint.service';
import { SystemService } from './services/system/system.service';
import { URLSafePipe } from './url.pipe';

@NgModule({
  declarations: [...components, LongPress, URLSafePipe],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    FormsModule,
    MatRippleModule,
    LottieComponent,
  ],
  providers: [
    AppService,
    ConfigService,
    ConversionService,
    EventService,
    NotificationService,
    [
      {
        provide: SystemService,
        deps: [ConfigService, NotificationService, HttpClient],
        useFactory: (
          configService: ConfigService,
          notificationService: NotificationService,
          httpClient: HttpClient,
        ) => {
          return new SystemOctoprintService(configService, notificationService, httpClient);
        },
      },
    ],
    [
      {
        provide: SocketService,
        deps: [ConfigService, SystemService, ConversionService, NotificationService, HttpClient],
        useFactory: (
          configService: ConfigService,
          systemService: SystemService,
          conversionService: ConversionService,
          notificationService: NotificationService,
          httpClient: HttpClient,
        ) => {
          return new OctoPrintSocketService(
            configService,
            systemService,
            conversionService,
            notificationService,
            httpClient,
          );
        },
      },
    ],
    [
      {
        provide: PrinterService,
        deps: [ConfigService, NotificationService, HttpClient],
        useFactory: (
          configService: ConfigService,
          notificationService: NotificationService,
          httpClient: HttpClient,
        ) => {
          return new PrinterOctoprintService(configService, notificationService, httpClient);
        },
      },
    ],
    [
      {
        provide: JobService,
        deps: [ConfigService, NotificationService, HttpClient],
        useFactory: (
          configService: ConfigService,
          notificationService: NotificationService,
          httpClient: HttpClient,
        ) => {
          return new JobOctoprintService(configService, notificationService, httpClient);
        },
      },
    ],
    [
      {
        provide: FilesService,
        deps: [ConfigService, NotificationService, HttpClient, ConversionService],
        useFactory: (
          configService: ConfigService,
          notificationService: NotificationService,
          httpClient: HttpClient,
          conversionService: ConversionService,
        ) => {
          return new FilesOctoprintService(configService, notificationService, httpClient, conversionService);
        },
      },
    ],
    [
      {
        provide: FilamentPluginService,
        deps: [ConfigService, HttpClient],
        useFactory: (configService: ConfigService, httpClient: HttpClient) => {
          if (configService.isSpoolManagerPluginEnabled()) {
            return new SpoolManagerOctoprintService(configService, httpClient);
          }
          return new FilamentManagerOctoprintService(configService, httpClient);
        },
      },
    ],
    [
      {
        provide: EnclosureService,
        deps: [ConfigService, NotificationService, HttpClient],
        useFactory: (
          configService: ConfigService,
          notificationService: NotificationService,
          httpClient: HttpClient,
        ) => {
          return new EnclosureOctoprintService(configService, notificationService, httpClient);
        },
      },
    ],
    [provideLottieOptions({ player: () => lottiePlayer })],
    [provideCacheableAnimationLoader()],
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {
  public constructor(library: FaIconLibrary) {
    library.addIconPacks(fas);
  }
}
