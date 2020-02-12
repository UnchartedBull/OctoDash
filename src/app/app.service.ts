import { Injectable } from '@angular/core';
import { ConfigService, Config } from './config/config.service';
import { NotificationService } from './notification/notification.service';
import { HttpClient } from '@angular/common/http';
import { ConfigOld } from './config/config.old';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private updateError: string[];
  private loadedFile = false;
  private ipc: any;
  private version: string;

  constructor(private configService: ConfigService, private notificationService: NotificationService, private http: HttpClient) {
    if (window.require) {
      try {
        this.ipc = window.require('electron').ipcRenderer;
        this.ipc.on('versionInformation', ({ }, versionInformation: VersionInformation) => {
          this.version = versionInformation.version;
          this.checkUpdate();
        });
      } catch (e) {
        this.notificationService.setError('Can\'t retrieve version information', 'Please open an issue for GitHub as this shouldn\'t happen.');
      }
    }

    this.updateError = ['.filament should have required property \'feedLength\'', '.filament should have required property \'feedSpeed\'', '. should have required property \'plugins\'', '.octodash.customActions[0] should have required property \'confirm\'', '.octodash.customActions[0] should have required property \'exit\'', '.octodash.customActions[1] should have required property \'confirm\'', '.octodash.customActions[1] should have required property \'exit\'', '.octodash.customActions[2] should have required property \'confirm\'', '.octodash.customActions[2] should have required property \'exit\'', '.octodash.customActions[3] should have required property \'confirm\'', '.octodash.customActions[3] should have required property \'exit\'', '.octodash.customActions[4] should have required property \'confirm\'', '.octodash.customActions[4] should have required property \'exit\'', '.octodash.customActions[5] should have required property \'confirm\'', '.octodash.customActions[5] should have required property \'exit\'', '.octodash should have required property \'fileSorting\'', '.octodash should have required property \'pollingInterval\'', '.octodash should have required property \'turnScreenOffWhileSleeping\''];
  }

  // If the errors can be automatically fixed return true here
  public autoFixError(): boolean {
    // TODO: remove ConfigOld after release
    const configOld = (Object.assign({}, this.configService.getCurrentConfig()) as object) as ConfigOld;
    const config: Config = {
      octoprint: {
        accessToken: configOld.octoprint.accessToken,
        url: configOld.octoprint.url
      },
      printer: {
        name: configOld.printer.name,
        xySpeed: configOld.printer.xySpeed,
        zSpeed: configOld.printer.zSpeed
      },
      filament: {
        density: configOld.filament.density,
        thickness: configOld.filament.thickness,
        feedLength: 470,
        feedSpeed: 100
      },
      plugins: {
        displayLayerProgress: {
          enabled: true
        },
        enclosure: {
          enabled: true,
          ambientSensorID: configOld.octodash.temperatureSensor.ambient,
          filament1SensorID: null,
          filament2SensorID: null
        },
        filamentManager: {
          enabled: true
        },
        preheatButton: {
          enabled: true
        },
        printTimeGenius: {
          enabled: true
        },
        psuControl: {
          enabled: false,
          turnOnPSUWhenExitingSleep: false
        }
      },
      octodash: {
        customActions: [{
          icon: 'home',
          command: 'G28',
          color: '#dcdde1',
          confirm: false,
          exit: false
        },
        {
          icon: 'ruler-vertical',
          command: 'G29',
          color: '#44bd32',
          confirm: false,
          exit: false
        },
        {
          icon: 'fire-alt',
          command: 'M140 S50; M104 S185',
          color: '#e1b12c',
          confirm: false,
          exit: true
        },
        {
          icon: 'snowflake',
          command: 'M140 S0; M104 S0',
          color: '#0097e6',
          confirm: false,
          exit: true
        },
        {
          icon: 'redo-alt',
          command: '[!RELOAD]',
          color: '#7f8fa6',
          confirm: true,
          exit: false
        },
        {
          icon: 'skull',
          command: '[!KILL]',
          color: '#e84118',
          confirm: true,
          exit: false
        }
        ],
        fileSorting: {
          attribute: 'name',
          order: 'asc'
        },
        pollingInterval: configOld.octoprint.apiInterval,
        touchscreen: configOld.octodash.touchscreen,
        turnScreenOffWhileSleeping: configOld.octodash.turnScreenOffSleep
      }
    };
    this.configService.saveConfig(config);
    this.configService.updateConfig();
    return false;
  }

  private checkUpdate(): void {
    this.http.get('https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest').subscribe(
      (data: GitHubRealeaseInformation) => {
        if (this.version !== data.name.replace('v', '')) {
          this.notificationService.setUpdate('It\'s time for an update',
            `Version ${data.name} is available now, while you're on v${this.version}. Consider updating :)`);
        }
      },
      () => null
    );
    setTimeout(this.checkUpdate.bind(this), 21.6 * 1000000);
  }

  public getVersion(): string {
    return this.version;
  }

  public turnDisplayOff(): void {
    if (this.ipc) {
      this.ipc.send('screenSleep', '');
    }
  }

  public turnDisplayOn(): void {
    if (this.ipc) {
      this.ipc.send('screenWakeup', '');
    }
  }

  public getUpdateError(): string[] {
    return this.updateError;
  }

  public setLoadedFile(value: boolean): void {
    this.loadedFile = value;
  }

  public getLoadedFile(): boolean {
    return this.loadedFile;
  }

  public convertByteToMegabyte(byte: number): string {
    return (byte / 1000000).toFixed(1);
  }

  public convertDateToString(date: Date): string {
    return `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
  }

  public convertSecondsToHours(input: number): string {
    const hours = (input / 60 / 60);
    let roundedHours = Math.floor(hours);
    const minutes = (hours - roundedHours) * 60;
    let roundedMinutes = Math.round(minutes);
    if (roundedMinutes === 60) {
      roundedMinutes = 0;
      roundedHours += 1;
    }
    return roundedHours + ':' + ('0' + roundedMinutes).slice(-2);
  }

  public convertFilamentLengthToAmount(filamentLength: number): number {
    return Math.round((Math.PI * (this.configService.getFilamentThickness() / 2) * filamentLength)
      * this.configService.getFilamentDensity() / 100) / 10;
  }
}

interface VersionInformation {
  version: string;
}

interface GitHubRealeaseInformation {
  name: string;
  [key: string]: any;
}
