import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Observer, Subscription, timer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { ConfigService } from './config/config.service';
import { NotificationService } from './notification/notification.service';
import { OctoprintConnectionAPI } from './octoprint-api/connectionAPI';
import { OctoprintPrinterStatusAPI } from './octoprint-api/printerStatusAPI';

@Injectable({
    providedIn: 'root',
})
export class PrinterService {
    private httpGETRequest: Subscription;
    private httpPOSTRequest: Subscription;
    private observable: Observable<PrinterStatusAPI>;

    public constructor(
        private http: HttpClient,
        private configService: ConfigService,
        private notificationService: NotificationService,
        private router: Router,
    ) {
        this.observable = new Observable((observer: Observer<PrinterStatusAPI>): void => {
            timer(500, this.configService.getAPIPollingInterval()).subscribe((): void => {
                if (this.httpGETRequest) {
                    this.httpGETRequest.unsubscribe();
                }
                this.httpGETRequest = this.http
                    .get(this.configService.getURL('printer'), this.configService.getHTTPHeaders())
                    .subscribe(
                        (data: OctoprintPrinterStatusAPI): void => {
                            const printerStatus: PrinterStatusAPI = {
                                status: data.state.text.toLowerCase(),
                                nozzle: {
                                    current: Math.round(data.temperature.tool0.actual),
                                    set: Math.round(data.temperature.tool0.target),
                                },
                                heatbed: {
                                    current: data.temperature.bed ? Math.round(data.temperature.bed.actual) : 0,
                                    set: data.temperature.bed ? Math.round(data.temperature.bed.target) : 0,
                                },
                            };
                            observer.next(printerStatus);
                        },
                        (error: HttpErrorResponse): void => {
                            if (error.status === 409) {
                                this.isPrinterOffline().then((printerOffline): void => {
                                    if (printerOffline) {
                                        this.router.navigate(['/standby']);
                                        this.notificationService.disableNotifications();
                                    } else {
                                        this.notificationService.setError(
                                            "Can't retrieve printer status!",
                                            error.message,
                                        );
                                    }
                                });
                            } else if (error.status === 0 && this.notificationService.getBootGrace()) {
                                const printerStatus: PrinterStatusAPI = {
                                    status: `connecting ...`,
                                    nozzle: {
                                        current: 0,
                                        set: 0,
                                    },
                                    heatbed: {
                                        current: 0,
                                        set: 0,
                                    },
                                };
                                observer.next(printerStatus);
                            } else {
                                const printerStatus: PrinterStatusAPI = {
                                    status: `error (${error.status})`,
                                    nozzle: {
                                        current: 0,
                                        set: 0,
                                    },
                                    heatbed: {
                                        current: 0,
                                        set: 0,
                                    },
                                };
                                observer.next(printerStatus);
                                this.notificationService.setError("Can't retrieve printer status!", error.message);
                            }
                        },
                    );
            });
        }).pipe(shareReplay(1));
    }

    public getObservable(): Observable<PrinterStatusAPI> {
        return this.observable;
    }

    public stopMotors(): void {
        this.executeGCode('M410');
    }

    public jog(x: number, y: number, z: number): void {
        const jogPayload: JogCommand = {
            command: 'jog',
            x,
            y,
            z,
            speed: z !== 0 ? this.configService.getZSpeed() * 60 : this.configService.getXYSpeed() * 60,
        };
        this.httpPOSTRequest = this.http
            .post(this.configService.getURL('printer/printhead'), jogPayload, this.configService.getHTTPHeaders())
            .subscribe(
                (): void => null,
                (error: HttpErrorResponse): void => {
                    this.notificationService.setError("Can't move Printhead!", error.message);
                },
            );
    }

    public extrude(amount: number, speed: number): void {
        let multiplier = 1;
        let toBeExtruded: number;
        if (amount < 0) {
            multiplier = -1;
            toBeExtruded = amount * -1;
        } else {
            toBeExtruded = amount;
        }

        while (toBeExtruded > 0) {
            if (toBeExtruded >= 100) {
                toBeExtruded -= 100;
                this.moveExtruder(100 * multiplier, speed);
            } else {
                this.moveExtruder(toBeExtruded * multiplier, speed);
                toBeExtruded = 0;
            }
        }
    }

    private moveExtruder(amount: number, speed: number): void {
        const extrudePayload: ExtrudeCommand = {
            command: 'extrude',
            amount,
            speed: speed * 60,
        };
        this.httpPOSTRequest = this.http
            .post(this.configService.getURL('printer/tool'), extrudePayload, this.configService.getHTTPHeaders())
            .subscribe(
                (): void => null,
                (error: HttpErrorResponse): void => {
                    this.notificationService.setError("Can't extrude Filament!", error.message);
                },
            );
    }

    public executeGCode(gCode: string): void {
        if (this.httpPOSTRequest) {
            this.httpPOSTRequest.unsubscribe();
        }
        const gCodePayload: GCodeCommand = {
            commands: gCode.split('; '),
        };
        this.httpPOSTRequest = this.http
            .post(this.configService.getURL('printer/command'), gCodePayload, this.configService.getHTTPHeaders())
            .subscribe(
                (): void => null,
                (error: HttpErrorResponse): void => {
                    this.notificationService.setError("Can't send GCode!", error.message);
                },
            );
    }

    public setTemperatureHotend(temperature: number): void {
        const temperatureHotendCommand: TemperatureHotendCommand = {
            command: 'target',
            targets: {
                tool0: temperature,
            },
        };
        this.httpPOSTRequest = this.http
            .post(
                this.configService.getURL('printer/tool'),
                temperatureHotendCommand,
                this.configService.getHTTPHeaders(),
            )
            .subscribe(
                (): void => null,
                (error: HttpErrorResponse): void => {
                    this.notificationService.setError("Can't set Hotend Temperature!", error.message);
                },
            );
    }

    public setTemperatureHeatbed(temperature: number): void {
        const temperatureHeatbedCommand: TemperatureHeatbedCommand = {
            command: 'target',
            target: temperature,
        };
        this.httpPOSTRequest = this.http
            .post(
                this.configService.getURL('printer/bed'),
                temperatureHeatbedCommand,
                this.configService.getHTTPHeaders(),
            )
            .subscribe(
                (): void => null,
                (error: HttpErrorResponse): void => {
                    this.notificationService.setError("Can't set Heatbed Temperature!", error.message);
                },
            );
    }

    public setFeedrate(feedrate: number): void {
        if (feedrate === 100) {
            return;
        }
        const feedrateCommand: FeedrateCommand = {
            command: 'feedrate',
            factor: feedrate,
        };
        this.httpPOSTRequest = this.http
            .post(this.configService.getURL('printer/printhead'), feedrateCommand, this.configService.getHTTPHeaders())
            .subscribe(
                (): void => null,
                (error: HttpErrorResponse): void => {
                    this.notificationService.setError("Can't set Feedrate!", error.message);
                },
            );
    }

    public setFlowrate(flowrate: number): void {
        if (flowrate === 100) {
            return;
        }
        const flowrateCommand: FeedrateCommand = {
            command: 'flowrate',
            factor: flowrate,
        };
        this.httpPOSTRequest = this.http
            .post(this.configService.getURL('printer/tool'), flowrateCommand, this.configService.getHTTPHeaders())
            .subscribe(
                (): void => null,
                (error: HttpErrorResponse): void => {
                    this.notificationService.setError("Can't set Flowrate!", error.message);
                },
            );
    }

    public setFanSpeed(percentage: number): void {
        this.executeGCode('M106 S' + Math.round((percentage / 100) * 255));
    }

    public isPrinterOffline(): Promise<boolean> {
        return new Promise((resolve): void => {
            this.http.get(this.configService.getURL('connection'), this.configService.getHTTPHeaders()).subscribe(
                (data: OctoprintConnectionAPI): void => {
                    resolve(data.current.state === 'Closed' || data.current.state.includes('Error:'));
                },
                (error: HttpErrorResponse): void => {
                    this.notificationService.setError("Can't retrieve connection state!", error.message);
                    resolve(false);
                },
            );
        });
    }
}

export interface PrinterStatusAPI {
    status: string;
    nozzle: PrinterValue;
    heatbed: PrinterValue;
}

export interface PrinterValue {
    current: number;
    set: number;
}

interface JogCommand {
    command: 'jog';
    x: number;
    y: number;
    z: number;
    speed: number;
}

interface ExtrudeCommand {
    command: 'extrude';
    amount: number;
    speed: number;
}

interface GCodeCommand {
    commands: string[];
}

interface FeedrateCommand {
    command: string;
    factor: number;
}

interface TemperatureHotendCommand {
    command: string;
    targets: {
        tool0: number;
        tool1?: number;
    };
}

interface TemperatureHeatbedCommand {
    command: string;
    target: number;
}
