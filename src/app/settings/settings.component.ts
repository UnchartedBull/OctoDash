import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";

import { AppService } from "../app.service";
import { Config, ConfigService } from "../config/config.service";
import { NotificationService } from "../notification/notification.service";

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
})
export class SettingsComponent implements OnInit {
  @Output() closeFunction = new EventEmitter<void>();
  @ViewChild("settingsMain") private settingsMain: ElementRef;
  @ViewChild("settingsGeneral") private settingsGeneral: ElementRef;
  @ViewChild("settingsOctoDash") private settingsOctoDash: ElementRef;
  @ViewChild("settingsPlugins") private settingsPlugins: ElementRef;
  @ViewChild("settingsCredits") private settingsCredits: ElementRef;

  public fadeOutAnimation = false;
  public config: Config;
  public customActionsPosition = [
    "Top Left",
    "Top Right",
    "Middle Left",
    "Middle Right",
    "Bottom Left",
    "Bottom Right",
  ];
  private overwriteNoSave = false;
  private pages = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private ipc: any;
  public update = false;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    public service: AppService
  ) {
    this.config = this.configService.getCurrentConfig();
    this.config = this.configService.revertConfigForInput(this.config);
    try {
      this.ipc = window.require("electron").ipcRenderer;
    } catch (e) {
      this.notificationService.setError(
        "Can't connect to backend",
        "Please restart your system. If the issue persists open an issue on GitHub."
      );
    }
  }

  public ngOnInit(): void {
    setTimeout((): void => {
      this.pages = [
        this.settingsMain.nativeElement,
        this.settingsGeneral.nativeElement,
        this.settingsOctoDash.nativeElement,
        this.settingsPlugins.nativeElement,
        this.settingsCredits.nativeElement,
      ];
    }, 400);
  }

  public hideSettings(): void {
    if (
      this.configService.isEqualToCurrentConfig(this.configService.createConfigFromInput(this.config)) ||
      this.overwriteNoSave
    ) {
      this.fadeOutAnimation = true;
      this.closeFunction.emit();
      setTimeout((): void => {
        this.fadeOutAnimation = false;
      }, 800);
    } else {
      this.notificationService.setWarning(
        "Configuration not saved!",
        "You haven't saved your config yet, so your changes will not be applied. Click close again if you want to discard your changes!"
      );
      this.overwriteNoSave = true;
    }
  }

  public changePage(page: number, current: number, direction: "forward" | "backward"): void {
    this.pages[current].classList.add("settings__content-slideout-" + direction);
    this.pages[page].classList.remove("settings__content-inactive");
    this.pages[page].classList.add("settings__content-slidein-" + direction);

    setTimeout((): void => {
      this.pages[current].classList.add("settings__content-inactive");
      this.pages[current].classList.remove("settings__content-slideout-" + direction);
      this.pages[page].classList.remove("settings__content-slidein-" + direction);
    }, 470);
  }

  public updateConfig(): void {
    const config = this.configService.createConfigFromInput(this.config);
    if (!this.configService.validateGiven(config)) {
      this.notificationService.setError("Config is invalid!", this.configService.getErrors().toString());
    }
    this.configService.saveConfig(config);
    this.overwriteNoSave = true;
    this.hideSettings();
    this.configService.updateConfig();
    this.ipc.send("reload", "");
  }

  public showUpdate(): void {
    this.update = true;
  }

  public hideUpdate(): void {
    this.update = false;
  }
}
