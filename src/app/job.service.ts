import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Observer, Subscription, timer } from "rxjs";
import { shareReplay } from "rxjs/operators";

import { AppService } from "./app.service";
import { ConfigService } from "./config/config.service";
import { FilesService } from "./files.service";
import { NotificationService } from "./notification/notification.service";
import { JobCommand, OctoprintFilament, OctoprintJobAPI } from "./octoprint-api/jobAPI";

@Injectable({
  providedIn: "root",
})
export class JobService {
  private httpGETRequest: Subscription;
  private httpPOSTRequest: Subscription;
  private observable: Observable<Job>;
  private observer: Observer<Job>;
  private printing = false;
  private previewWhilePrinting = false;

  public constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private notificationService: NotificationService,
    private service: AppService,
    private fileService: FilesService
  ) {
    this.previewWhilePrinting = this.configService.showThumbnailByDefault();
    this.observable = new Observable((observer: Observer<Job>): void => {
      this.observer = observer;
      timer(750, this.configService.getAPIPollingInterval()).subscribe((): void => {
        if (this.httpGETRequest) {
          this.httpGETRequest.unsubscribe();
        }
        this.httpGETRequest = this.http
          .get(this.configService.getURL("job"), this.configService.getHTTPHeaders())
          .subscribe(
            async (data: OctoprintJobAPI): Promise<void> => {
              let job: Job = null;
              if (data.job && data.job.file.name) {
                this.printing = ["Printing", "Pausing", "Paused", "Cancelling", "Printing from SD"].includes(
                  data.state
                );
                try {
                  job = {
                    status: data.state,
                    filename: data.job.file.display.replace(".gcode", "").replace(".ufp", ""),
                    thumbnail: await this.fileService.getThumbnail(
                      "/" + data.job.file.origin + "/" + data.job.file.path
                    ),
                    progress: Math.round((data.progress.filepos / data.job.file.size) * 100),
                    ...(data.job.filament !== null
                      ? {
                          filamentAmount: this.service.convertFilamentVolumeToWeight(
                            this.getTotalAmountOfFilament(data.job.filament)
                          ),
                        }
                      : {}),
                    ...(data.progress.printTimeLeft !== null
                      ? {
                          timeLeft: {
                            value: this.service.convertSecondsToHours(data.progress.printTimeLeft),
                            unit: "h",
                          },
                        }
                      : {}),
                    timePrinted: {
                      value: this.service.convertSecondsToHours(data.progress.printTime),
                      unit: "h",
                    },
                    ...(data.job.estimatedPrintTime !== null
                      ? {
                          estimatedPrintTime: {
                            value: this.service.convertSecondsToHours(data.job.estimatedPrintTime),
                            unit: "h",
                          },
                          estimatedEndTime: this.calculateEndTime(data.job.estimatedPrintTime),
                        }
                      : {}),
                  };
                } catch (error) {
                  this.notificationService.setError("Can't retrieve Job Status", error);
                }
              } else {
                this.printing = false;
              }
              observer.next(job);
            },
            (error: HttpErrorResponse): void => {
              this.printing = false;
              this.notificationService.setError("Can't retrieve jobs!", error.message);
            }
          );
      });
    }).pipe(shareReplay(1));
    this.observable.subscribe();
  }

  private getTotalAmountOfFilament(filamentAmount: OctoprintFilament): number {
    let filamentLength = 0;
    for (const property in filamentAmount) {
      if (
        Object.prototype.hasOwnProperty.call(filamentAmount, property) &&
        Object.prototype.hasOwnProperty.call(filamentAmount[property], "volume")
      ) {
        filamentLength += filamentAmount[property].volume;
      }
    }
    return filamentLength;
  }

  public deleteJobInformation(): void {
    this.observer.next(null);
  }

  public getObservable(): Observable<Job> {
    return this.observable;
  }

  public isPrinting(): boolean {
    return this.printing;
  }

  public togglePreviewWhilePrinting(): void {
    this.previewWhilePrinting = !this.previewWhilePrinting;
  }

  public showPreviewWhilePrinting(): boolean {
    return this.previewWhilePrinting;
  }

  public cancelJob(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const cancelPayload: JobCommand = {
      command: "cancel",
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL("job"), cancelPayload, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          if (error.status === 409) {
            this.notificationService.setError(
              "Can't cancel Job!",
              "There is no running job, that could be cancelled (409)"
            );
          } else {
            this.notificationService.setError("Can't cancel Job!", error.message);
          }
        }
      );
  }

  public pauseJob(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const pausePayload: JobCommand = {
      command: "pause",
      action: "pause",
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL("job"), pausePayload, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          if (error.status === 409) {
            this.notificationService.setError(
              "Can't pause Job!",
              "There is no running job, that could be paused (409)"
            );
          } else {
            this.notificationService.setError("Can't pause Job!", error.message);
          }
        }
      );
  }

  public resumeJob(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const pausePayload: JobCommand = {
      command: "pause",
      action: "resume",
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL("job"), pausePayload, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          if (error.status === 409) {
            this.notificationService.setError(
              "Can't resume Job!",
              "There is no paused job, that could be resumed (409)"
            );
          } else {
            this.notificationService.setError("Can't resume Job!", error.message);
          }
        }
      );
  }

  public startJob(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const pausePayload: JobCommand = {
      command: "start",
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL("job"), pausePayload, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          if (error.status === 409) {
            this.notificationService.setError("Can't start Job!", "There is already a job running (409)");
          } else {
            this.notificationService.setError("Can't start Job!", error.message);
          }
        }
      );
  }

  public preheat(): void {
    if (this.httpPOSTRequest) {
      this.httpPOSTRequest.unsubscribe();
    }
    const preheatPayload: JobCommand = {
      command: "preheat",
    };
    this.httpPOSTRequest = this.http
      .post(this.configService.getURL("plugin/preheat"), preheatPayload, this.configService.getHTTPHeaders())
      .subscribe(
        (): void => null,
        (error: HttpErrorResponse): void => {
          this.notificationService.setError("Can't preheat printer!", error.message);
        }
      );
  }

  private calculateEndTime(duration: number): string {
    const date = new Date();
    date.setSeconds(date.getSeconds() + duration);
    return `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;
  }
}

interface Duration {
  value: string;
  unit: string;
}

export interface Job {
  status: string;
  filename: string;
  thumbnail: string | undefined;
  progress: number;
  filamentAmount?: number;
  timeLeft?: Duration;
  timePrinted: Duration;
  estimatedPrintTime?: Duration;
  estimatedEndTime?: string;
}
