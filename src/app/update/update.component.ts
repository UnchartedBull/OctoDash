import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from "@angular/core";

import { AppService } from "../app.service";
import { NotificationService } from "../notification/notification.service";
import { OctoprintService } from "../octoprint.service";

@Component({
  selector: "app-update",
  templateUrl: "./update.component.html",
  styleUrls: ["./update.component.scss"],
})
export class UpdateComponent implements OnInit {
  @Output() closeFunction = new EventEmitter<void>(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ipc: any;
  private installationAnimationInterval: number;
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
  public page = 1;

  constructor(
    public service: AppService,
    private notificationService: NotificationService,
    private octoprintService: OctoprintService,
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
      this.closeUpdateWindow();
    } else {
      this.setupListeners();
      this.update(this.service.getLatestVersionAssetsURL());
    }
  }

  private setupListeners(): void {
    this.ipc.on("updateError", (_, updateError: UpdateError): void => {
      this.notificationService.setError("Can't install update!", updateError.error.message);
      this.closeUpdateWindow();
    });

    this.ipc.on("updateDownloadProgress", (_, updateDownloadProgress: UpdateDownloadProgress): void => {
      this.updateProgress = updateDownloadProgress;
      this.changeDetector.detectChanges();
    });

    this.ipc.on("updateDownloadFinished", (): void => {
      this.page = 2;
      this.changeDetector.detectChanges();
      setTimeout(() => {
        const updateProgressBar = document.getElementById("installUpdateProgress");
        updateProgressBar.style.marginLeft = "40vw";
        this.installationAnimationInterval = setInterval(() => {
          updateProgressBar.style.marginLeft = updateProgressBar.style.marginLeft === "0vw" ? "40vw" : "0vw";
        }, 2050);
      }, 250);
    });

    this.ipc.on("updateInstalled", (): void => {
      this.page = 3;
      this.changeDetector.detectChanges();
    });
  }

  private closeUpdateWindow(): void {
    this.page = 1;
    clearInterval(this.installationAnimationInterval);
    this.closeFunction.emit();
  }

  private update(assetsURL: string): void {
    this.ipc.send("update", {
      assetsURL: assetsURL,
    });
  }

  public reboot(): void {
    this.octoprintService.sendSystemCommand("reboot");
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
