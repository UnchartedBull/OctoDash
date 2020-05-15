import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';

@Injectable({
    providedIn: 'root',
})
export class AppService {
    private updateError: string[];
    private loadedFile = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private ipc: any;
    private version: string;

    public constructor(
        private configService: ConfigService,
        private notificationService: NotificationService,
        private http: HttpClient,
    ) {
        if (window.require) {
            try {
                this.ipc = window.require('electron').ipcRenderer;
                this.ipc.on('versionInformation', ({}, versionInformation: VersionInformation): void => {
                    this.version = versionInformation.version;
                    this.checkUpdate();
                });
            } catch (e) {
                this.notificationService.setError(
                    "Can't retrieve version information",
                    "Please open an issue for GitHub as this shouldn't happen.",
                );
            }
        }

        this.updateError = [
            ".filament should have required property 'feedSpeedSlow'",
            ".filament should have required property 'purgeDistance'",
        ];
    }

    // If the errors can be automatically fixed return true here
    public autoFixError(): boolean {
        let config = this.configService.getCurrentConfig();
        config.filament.feedLength = 0;
        config.filament.feedSpeed = 30;
        config.filament.feedSpeedSlow = 5;
        config.filament.purgeDistance = 30;
        this.configService.saveConfig(config);
        this.configService.updateConfig();
        return false;
    }

    private checkUpdate(): void {
        this.http.get('https://api.github.com/repos/UnchartedBull/OctoDash/releases/latest').subscribe(
            (data: GitHubReleaseInformation): void => {
                if (this.version !== data.name.replace('v', '')) {
                    this.notificationService.setUpdate(
                        "It's time for an update",
                        `Version ${data.name} is available now, while you're on v${this.version}. Consider updating :)`,
                    );
                }
            },
            (): void => null,
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
        return `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()} ${(
            '0' + date.getHours()
        ).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
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
        return roundedHours + ':' + ('0' + roundedMinutes).slice(-2);
    }

    public convertFilamentLengthToAmount(filamentLength: number): number {
        return (
            Math.round(
                (Math.PI *
                    (this.configService.getFilamentThickness() / 2) *
                    filamentLength *
                    this.configService.getFilamentDensity()) /
                    100,
            ) / 10
        );
    }
}

interface VersionInformation {
    version: string;
}

interface GitHubReleaseInformation {
    name: string;
    [key: string]: string;
}
