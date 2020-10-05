import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/notification/notification.service';
import { OctoprintScriptService } from 'src/app/octoprint-script.service';

import { Config, ConfigService } from '../config.service';

@Component({
  selector: 'app-no-config',
  templateUrl: './no-config.component.html',
  styleUrls: ['./no-config.component.scss'],
})
export class NoConfigComponent implements OnInit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ipc: any;

  public page = 0;
  public totalPages = 7;

  public configUpdate: boolean;
  public config: Config;
  public configErrors: string[];
  public configValid: boolean;
  public configSaved: string;

  public manualURL = false;
  public octoprintNodes: OctoprintNodes;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private OctoPrint: any;

  public octoprintConnection = false;
  public octoprintConnectionError: string;

  public constructor(
    private configService: ConfigService,
    private router: Router,
    private notificationService: NotificationService,
    private octoprintScriptService: OctoprintScriptService,
    private changeDetector: ChangeDetectorRef,
    private zone: NgZone,
  ) {
    try {
      this.ipc = window.require('electron').ipcRenderer;
    } catch (e) {
      this.notificationService.setError(
        "Can't connect to backend",
        'Please restart your system. If the issue persists open an issue on GitHub.',
      );
    }

    this.configUpdate = this.configService.isUpdate();
    if (this.configUpdate) {
      this.config = configService.getCurrentConfig();
    } else {
      this.config = this.getDefaultConfig();
    }
    this.config = this.configService.revertConfigForInput(this.config);
  }

  public ngOnInit(): void {
    this.changeProgress();

    this.ipc.on('discoveredNodes', (_, nodes: OctoprintNodes) => {
      this.octoprintNodes = nodes;
      this.changeDetector.detectChanges();
    });
  }

  public discoverOctoprintInstances(): void {
    this.octoprintNodes = null;
    this.ipc.send('discover');
    setTimeout(() => {
      const searching = document.querySelector('.no-config__discovered-instances__searching');
      if (searching) {
        searching.innerHTML = 'no instances found.';
      }
    }, 10000);
  }

  public setOctoprintInstance(node: OctoprintNodes): void {
    this.config.octoprint.url = node.url;
    this.config = this.configService.revertConfigForInput(this.config);
    this.increasePage();
  }

  public enterURLManually(): void {
    this.config.octoprint.urlSplit = {
      url: 'localhost',
      port: 5000,
    };
    this.manualURL = true;
  }

  private async loadOctoprintClient() {
    try {
      await this.zone.run(async () => {
        await this.octoprintScriptService.initialize(
          `http://${this.config.octoprint.urlSplit.url}:${this.config.octoprint.urlSplit.port}/api/`,
        );
        this.OctoPrint = this.octoprintScriptService.getInstance();
      });
    } catch (e) {
      this.notificationService.setError(
        "Can't connect to OctoPrint!",
        `Check the URL/IP and make sure that your firewall allows access to port ${this.config.octoprint.urlSplit.port} on host ${this.config.octoprint.urlSplit.url}.`,
      );
      this.page = 1;
    }
  }

  public loginWithOctoPrintUI(): void {
    this.notificationService.setUpdate(
      'Login request send!',
      'Please confirm the request via the popup in the OctoPrint WebUI.',
    );

    const closeInfo = setTimeout(() => {
      this.notificationService.closeNotification();
    }, 3000);

    this.OctoPrint.plugins.appkeys
      .authenticate('OctoDash')
      .done((apiKey: string) => {
        this.config.octoprint.accessToken = apiKey;
        this.octoprintScriptService.authenticate(apiKey);
        this.OctoPrint = this.octoprintScriptService.getInstance();

        // FIXME: to be removed before merge
        this.OctoPrint.printerprofiles
          .list()
          .done(profiles => {
            this.config.printer.name = profiles.profiles._default.name;
          })
          .fail(() => console.error('ERR'));
        // END

        this.changeDetector.detectChanges();
        setTimeout(() => {
          this.increasePage();
        }, 600);
      })
      .fail(() => {
        this.notificationService.setWarning(
          'Something went wrong!',
          "Can' retrieve the API Key, please try again or create one manually and enter it down below.",
        );
      })
      .always(() => {
        clearTimeout(closeInfo);
      });
  }

  changeFeedLength(amount: number): void {
    if (this.config.filament.feedLength + amount < 0) {
      this.config.filament.feedLength = 0;
    } else if (this.config.filament.feedLength + amount > 9999) {
      this.config.filament.feedLength = 9999;
    } else {
      this.config.filament.feedLength += amount;
    }
  }

  changeFeedSpeed(amount: number): void {
    if (this.config.filament.feedSpeed + amount < 0) {
      this.config.filament.feedSpeed = 0;
    } else if (this.config.filament.feedSpeed + amount > 999) {
      this.config.filament.feedSpeed = 999;
    } else {
      this.config.filament.feedSpeed += amount;
    }
  }

  public createConfig(): void {
    this.configErrors = [];
    this.octoprintConnectionError = null;
    this.config = this.configService.createConfigFromInput(this.config);
    this.validateConfig();
  }

  public async validateConfig(): Promise<void> {
    this.configValid = this.configService.validateGiven(this.config);
    if (!this.configValid) {
      this.configErrors = this.configService.getErrors();
    } else {
      this.saveConfig();
    }
  }

  public saveConfig(): void {
    this.configSaved = this.configService.saveConfig(this.config);
  }

  public finishWizard(): void {
    this.configService.updateConfig();
    this.router.navigate(['/main-screen']);
  }

  private changePage(value: number): void {
    if (this.page + value > this.totalPages || this.page + value < 0) {
      return;
    }
    this.beforeNavigation(value);
    this.page = this.page + value;
    this.afterNavigation();
    this.changeProgress();
  }

  private beforeNavigation(value: number): void {
    switch (this.page) {
      case 1:
        this.ipc.send('stopDiscover');
        if (value > 0) {
          this.loadOctoprintClient();
        }
        break;
      case this.totalPages - 1:
        if (value < 0) {
          this.config = this.configService.revertConfigForInput(this.config);
        }
        break;
    }
  }

  private afterNavigation(): void {
    switch (this.page) {
      case 1:
        this.discoverOctoprintInstances();
        break;
      case this.totalPages:
        this.createConfig();
        break;
    }
  }

  public increasePage(): void {
    this.changePage(1);
  }

  public decreasePage(): void {
    this.changePage(-1);
  }

  public changeProgress(): void {
    document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
    this.changeDetector.detectChanges();
  }

  public getDefaultConfig(): Config {
    return {
      octoprint: {
        url: 'http://localhost:5000/api/',
        accessToken: '',
      },
      printer: {
        name: '',
        xySpeed: 150,
        zSpeed: 5,
        zBabystepGCode: 'M290 Z',
        defaultTemperatureFanSpeed: {
          hotend: 200,
          heatbed: 60,
          fan: 100,
        },
      },
      filament: {
        thickness: 1.75,
        density: 1.25,
        feedLength: 0,
        feedSpeed: 20,
        feedSpeedSlow: 3,
        purgeDistance: 30,
        useM600: false,
      },
      plugins: {
        displayLayerProgress: {
          enabled: true,
        },
        enclosure: {
          enabled: false,
          ambientSensorID: null,
          filament1SensorID: null,
          filament2SensorID: null,
        },
        filamentManager: {
          enabled: true,
        },
        preheatButton: {
          enabled: true,
        },
        printTimeGenius: {
          enabled: true,
        },
        psuControl: {
          enabled: false,
          turnOnPSUWhenExitingSleep: false,
        },
      },
      octodash: {
        customActions: [
          {
            icon: 'home',
            command: 'G28',
            color: '#dcdde1',
            confirm: false,
            exit: true,
          },
          {
            icon: 'ruler-vertical',
            command: 'G29',
            color: '#44bd32',
            confirm: false,
            exit: true,
          },
          {
            icon: 'fire-alt',
            command: 'M140 S50; M104 S185',
            color: '#e1b12c',
            confirm: false,
            exit: true,
          },
          {
            icon: 'snowflake',
            command: 'M140 S0; M104 S0',
            color: '#0097e6',
            confirm: false,
            exit: true,
          },
          {
            icon: 'redo-alt',
            command: '[!RELOAD]',
            color: '#7f8fa6',
            confirm: true,
            exit: false,
          },
          {
            icon: 'skull',
            command: '[!KILL]',
            color: '#e84118',
            confirm: true,
            exit: false,
          },
        ],
        fileSorting: {
          attribute: 'name',
          order: 'asc',
        },
        pollingInterval: 2000,
        touchscreen: true,
        turnScreenOffWhileSleeping: false,
        preferPreviewWhilePrinting: false,
      },
    };
  }
}

interface OctoprintNodes {
  id: number;
  name: string;
  version: string;
  url: string;
  disable: boolean;
}
