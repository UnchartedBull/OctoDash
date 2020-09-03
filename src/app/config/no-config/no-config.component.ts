import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef,
    private octoprintScriptService: OctoprintScriptService,
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
    this.increasePage(true);
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
      });
    } catch (e) {
      this.notificationService.setError(
        "Can't connect to OctoPrint!",
        `Check the URL/IP and make sure that your firewall allows access to port ${this.config.octoprint.urlSplit.port} on host ${this.config.octoprint.urlSplit.url}.`,
      );
      this.page = 1;
    }
  }

  public async testOctoprintAPI(): Promise<boolean> {
    const httpHeaders = {
      headers: new HttpHeaders({
        'x-api-key': this.config.octoprint.accessToken,
      }),
    };
    this.http.get(this.config.octoprint.url + 'connection', httpHeaders).subscribe(
      (): void => {
        this.octoprintConnection = true;
        this.saveConfig();
      },
      (error: HttpErrorResponse): void => {
        this.octoprintConnection = false;
        this.octoprintConnectionError = error.message;
      },
    );
    return true;
  }

  public createConfig(): boolean {
    this.configErrors = [];
    this.octoprintConnectionError = null;
    this.config = this.configService.createConfigFromInput(this.config);
    this.validateConfig();
    return true;
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

  public increasePage(force = false): void {
    if (this.page === this.totalPages || (!this.manualURL && this.page === 1 && force === false)) {
      return;
    }
    if (this.page === 1) {
      this.ipc.send('stopDiscover');
      this.loadOctoprintClient();
    }
    this.page += 1;
    if (this.page === 1) {
      this.discoverOctoprintInstances();
    }
    if (this.page === this.totalPages) {
      this.createConfig();
    }
    this.changeProgress();
  }

  public decreasePage(): void {
console.log(this.page);
    if (this.page === 0) {
      return;
    }
    if (this.page === this.totalPages - 1) {
      this.config = this.configService.revertConfigForInput(this.config);
    }
    this.page -= 1;
    this.changeProgress();
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
        feedSpeed: 30,
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
