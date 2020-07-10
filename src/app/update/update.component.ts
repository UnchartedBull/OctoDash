import { Component, EventEmitter, OnInit, Output } from "@angular/core";

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

  constructor(public service: AppService, private notificationService: NotificationService) {
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
    if (!this.service.latestVersion || this.service.getLatestVersionAssetsURL()) {
      this.notificationService.setWarning(
        "Can't initiate update!",
        "Some information is missing, please try again in an hour or update manually."
      );
      this.closeFunction.emit();
    } else {
      this.update(this.service.getLatestVersionAssetsURL());
    }
  }

  private update(assetsURL: string): void {
    this.ipc.send("update", {
      assetsURL: assetsURL,
    });
  }
}
