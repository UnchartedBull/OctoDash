import { HttpClient } from '@angular/common/http';

import { AppService } from './app.service';
import { ConfigService } from './config.service';
import { ConversionService } from './conversion.service';
import { EnclosureOctoprintService } from './enclosure/enclosure.octoprint.service';
import { EnclosureService } from './enclosure/enclosure.service';
import { EventService } from './event.service';
import { FilamentService } from './filament/filament.service';
import { FilamentManagerOctoprintService } from './filament/filament-manager.octoprint.service';
import { FilamentPluginService } from './filament/filament-plugin.service';
import { SpoolManagerOctoprintService } from './filament/spool-manager.octoprint.service';
import { FilesOctoprintService } from './files/files.octoprint.service';
import { FilesService } from './files/files.service';
import { JobOctoprintService } from './job/job.octoprint.service';
import { JobService } from './job/job.service';
import { NotificationService } from './notification.service';
import { PrinterOctoprintService } from './printer/printer.octoprint.service';
import { PrinterService } from './printer/printer.service';
import { PrusaMMUService } from './prusammu/prusa-mmu.service';
import { OctoPrintSocketService } from './socket/socket.octoprint.service';
import { SocketService } from './socket/socket.service';
import { SystemOctoprintService } from './system/system.octoprint.service';
import { SystemService } from './system/system.service';

export default [
  AppService,
  ConfigService,
  ConversionService,
  EventService,
  PrusaMMUService,
  FilamentService,
  NotificationService,
  [
    {
      provide: SystemService,
      deps: [ConfigService, NotificationService, HttpClient],
      useFactory: (configService: ConfigService, notificationService: NotificationService, httpClient: HttpClient) => {
        return new SystemOctoprintService(configService, notificationService, httpClient);
      },
    },
  ],
  [
    {
      provide: SocketService,
      deps: [ConfigService, SystemService, ConversionService, NotificationService, PrusaMMUService, HttpClient],
      useFactory: (
        configService: ConfigService,
        systemService: SystemService,
        conversionService: ConversionService,
        notificationService: NotificationService,
        prusaMMUService: PrusaMMUService,
        httpClient: HttpClient,
      ) => {
        return new OctoPrintSocketService(
          configService,
          systemService,
          conversionService,
          notificationService,
          prusaMMUService,
          httpClient,
        );
      },
    },
  ],
  [
    {
      provide: PrinterService,
      deps: [ConfigService, NotificationService, HttpClient],
      useFactory: (configService: ConfigService, notificationService: NotificationService, httpClient: HttpClient) => {
        return new PrinterOctoprintService(configService, notificationService, httpClient);
      },
    },
  ],
  [
    {
      provide: JobService,
      deps: [ConfigService, NotificationService, HttpClient],
      useFactory: (configService: ConfigService, notificationService: NotificationService, httpClient: HttpClient) => {
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
      useFactory: (configService: ConfigService, notificationService: NotificationService, httpClient: HttpClient) => {
        return new EnclosureOctoprintService(configService, notificationService, httpClient);
      },
    },
  ],
];
