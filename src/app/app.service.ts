import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { ConfigService } from "./config/config.service";
import { NotificationService } from "./notification/notification.service";

@Injectable({
  providedIn: "root",
})
export class AppService {
  private updateError: string[];
  private loadedFile = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ipc: any;
  public version: string;
  public latestVersion: string;
  private latestVersionAssetsURL: string;
  public updateAvailable = false;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private http: HttpClient
  ) {
    try {
      this.ipc = window.require("electron").ipcRenderer;
      this.enableVersionListener();
      this.enableCustomCSSListener();
      setTimeout(() => {
        this.ipc.send("appInfo");
      }, 0);
    } catch (e) {
      this.notificationService.setError(
        "Can't connect to backend",
        "Please restart your system. If the issue persists open an issue on GitHub."
      );
    }
    this.updateError = [
      ".filament should have required property 'useM600'",
      ".octodash should have required property 'preferPreviewWhilePrinting'",
    ];
  }

  // If the errors can be automatically fixed return true here
  public autoFixError(): boolean {
    const config = this.configService.getCurrentConfig();
    config.filament.useM600 = false;
    config.octodash.preferPreviewWhilePrinting = false;
    this.configService.saveConfig(config);
    this.configService.updateConfig();
    return true;
  }

  private enableVersionListener(): void {
    this.ipc.on("versionInformation", (_, versionInformation: VersionInformation): void => {
      this.version = versionInformation.version;
      this.checkUpdate();
    });
  }

  private enableCustomCSSListener(): void {
    this.ipc.on("customStyles", (_, customCSS: string): void => {
      const css = document.createElement("style");
      css.type = "text/css";
      css.appendChild(document.createTextNode(customCSS));
      document.head.append(css);
    });

    this.ipc.on("customStylesError", (_, customCSSError: string): void => {
      this.notificationService.setError("Can't load custom styles!", customCSSError);
    });
  }

  private checkUpdate(): void {
    this.http.get("https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest").subscribe(
      (data: GitHubReleaseInformation): void => {
        if (this.version !== data.name.replace("v", "")) {
          this.updateAvailable = true;
        }
        this.latestVersion = data.name.replace("v", "");
        this.latestVersionAssetsURL = data.assets_url;
      },
      (): void => null
    );
    setTimeout(this.checkUpdate.bind(this), 3600000);
  }

  public getVersion(): string {
    return this.version;
  }

  public getLatestVersion(): string {
    return this.latestVersion;
  }

  public turnDisplayOff(): void {
    if (this.ipc) {
      this.ipc.send("screenSleep", "");
    }
  }

  public turnDisplayOn(): void {
    if (this.ipc) {
      this.ipc.send("screenWakeup", "");
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

  public getLatestVersionAssetsURL(): string {
    return this.latestVersionAssetsURL;
  }

  public convertByteToMegabyte(byte: number): string {
    return (byte / 1000000).toFixed(1);
  }

  public convertDateToString(date: Date): string {
    return `${("0" + date.getDate()).slice(-2)}.${("0" + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()} ${(
      "0" + date.getHours()
    ).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}:${("0" + date.getSeconds()).slice(-2)}`;
  }

  public convertSecondsToHours(input: number): string {
    const hours = input / 60 / 60;
    let roundedHours = Math.floor(hours);
    const minutes = (hours - roundedHours) * 60;
    let roundedMinutes = Math.round(minutes);
    if (roundedMinutes === 60) {
      roundedMinutes = 0;
      roundedHours += 1;
    }
    return roundedHours + ":" + ("0" + roundedMinutes).slice(-2);
  }

  public convertFilamentVolumeToWeight(filamentVolume: number): number {
    return Math.round(filamentVolume * this.configService.getFilamentDensity() * 10) / 10;
  }
}

interface VersionInformation {
  version: string;
}

interface GitHubReleaseInformation {
  name: string;
  // eslint-disable-next-line camelcase
  assets_url: string;
  [key: string]: string;
}
