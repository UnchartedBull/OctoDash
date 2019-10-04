import { Injectable } from '@angular/core';
import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private updateError: string[];
  private loadedFile = false;
  private ipc: any;
  private version: string;

  constructor(private configService: ConfigService, private notificationService: NotificationService, private http: HttpClient) {
    if (window.require && configService.config.octodash.temperatureSensor !== null) {
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

    this.updateError = [
      '.printer should have required property \'xySpeed\'',
      '.printer should have required property \'zSpeed\'',
      '.octodash should have required property \'customActions\''];
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
    return Math.round((Math.PI * (this.configService.config.filament.thickness / 2) * filamentLength)
      * this.configService.config.filament.density / 100) / 10;
  }

  // If the errors can be automatically fixed return true here
  public autoFixError(): boolean {
    const config = this.configService.config;
    config.octodash.customActions = [
      {
        icon: 'home',
        command: 'G28',
        color: '#dcdde1'
      },
      {
        icon: 'ruler-vertical',
        command: 'G29',
        color: '#44bd32'
      },
      {
        icon: 'fire-alt',
        command: 'M140 S50; M104 S185',
        color: '#e1b12c'
      },
      {
        icon: 'snowflake',
        command: 'M140 S0; M104 S0',
        color: '#0097e6'
      },
      {
        icon: 'redo-alt',
        command: '[!RELOAD]',
        color: '#7f8fa6'
      },
      {
        icon: 'skull',
        command: '[!KILL]',
        color: '#e84118'
      }
    ];
    config.printer.xySpeed = 150;
    config.printer.zSpeed = 5;
    this.configService.saveConfig(config);
    this.configService.updateConfig();
    return true;
  }

}

interface VersionInformation {
  version: string;
}

interface GitHubRealeaseInformation {
  name: string;
  [key: string]: any;
}
