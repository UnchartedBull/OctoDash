import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from "@angular/core";

import { AppService } from "../app.service";
import { NotificationService } from "../notification/notification.service";

@Component({
  selector: "app-update",
  templateUrl: "./update.component.html",
  styleUrls: ["./update.component.scss"],
})
export class UpdateComponent implements OnInit {
  @Output() closeFunction = new EventEmitter<void>(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ipc: any;
  public updateProgress: UpdateDownloadProgress = {
    percentage: 0,
    transferred: 0,
    total: "--.-",
    remaining: 0,
    eta: "--:--",
    runtime: "--:--",
    delta: 0,
    speed: "--.-",
  };

  constructor(
    public service: AppService,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef
  ) {
    try {
      this.ipc = window.require("electron").ipcRenderer;
    } catch (e) {
      this.notificationService.setError(
        "Can't connect to backend",
        "Please restart your system. If the issue persists open an issue on GitHub."
      );
    }
  }

  ngOnInit(): void {
    if (!this.service.latestVersion || !this.service.getLatestVersionAssetsURL()) {
      this.notificationService.setWarning(
        "Can't initiate update!",
        "Some information is missing, please try again in an hour or update manually."
      );
      this.closeFunction.emit();
    } else {
      this.setupListeners();
      this.update(this.service.getLatestVersionAssetsURL());
    }
  }

  private setupListeners(): void {
    this.ipc.on("updateError", (_, updateError: UpdateError): void => {
      this.notificationService.setError("Can't install update!", updateError.error.message);
      this.closeFunction.emit();
    });

    this.ipc.on("updateDownloadProgress", (_, updateDownloadProgress: UpdateDownloadProgress): void => {
      this.updateProgress = updateDownloadProgress;
      this.changeDetector.detectChanges();
    });
  }

  private update(assetsURL: string): void {
    this.ipc.send("update", {
      assetsURL: assetsURL,
    });
  }
}

interface UpdateError {
  error: {
    message: string;
    stack?: string;
  };
}

interface UpdateDownloadProgress {
  percentage: number;
  transferred: number;
  total: number | string;
  remaining: number;
  eta: string;
  runtime: string;
  delta: number;
  speed: number | string;
}
