import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { AppService } from '../app.service';
import { Config } from '../config/config.model';
import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  @Output() closeFunction = new EventEmitter<void>();
  @ViewChild('settingsMain') private settingsMain: ElementRef;
  @ViewChild('settingsGeneral') private settingsGeneral: ElementRef;
  @ViewChild('settingsOctoDash') private settingsOctoDash: ElementRef;
  @ViewChild('settingsPlugins') private settingsPlugins: ElementRef;
  @ViewChild('settingsCredits') private settingsCredits: ElementRef;

  public fadeOutAnimation = false;
  public config: Config;
  public customActionsPosition = [
    'Top Left',
    'Top Right',
    'Middle Left',
    'Middle Right',
    'Bottom Left',
    'Bottom Right',
  ];
  private overwriteNoSave = false;
  private pages = [];
  public update = false;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private electronService: ElectronService,
    public service: AppService,
  ) {
    this.config = this.configService.getCurrentConfig();
    this.config.octoprint.urlSplit = this.configService.splitOctoprintURL(this.config.octoprint.url);
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

  public ngOnDestroy(): void {
    this.electronService.ipcRenderer.removeListener('configSaved', this.onConfigSaved.bind(this));
    this.electronService.ipcRenderer.removeListener('configSaveFail', this.onConfigSaveFail.bind(this));
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
      }, 5000);
    } else {
      this.notificationService.setWarning(
        'Configuration not saved!',
        "You haven't saved your config yet, so your changes will not be applied. Click close again if you want to discard your changes!",
      );
      this.overwriteNoSave = true;
    }
  }

  public changePage(page: number, current: number, direction: 'forward' | 'backward'): void {
    this.pages[current].classList.add('settings__content-slideout-' + direction);
    this.pages[page].classList.remove('settings__content-inactive');
    this.pages[page].classList.add('settings__content-slidein-' + direction);

    setTimeout((): void => {
      this.pages[current].classList.add('settings__content-inactive');
      this.pages[current].classList.remove('settings__content-slideout-' + direction);
      this.pages[page].classList.remove('settings__content-slidein-' + direction);
    }, 370);
  }

  public updateConfig(): void {
    const config = this.configService.createConfigFromInput(this.config);

    this.electronService.ipcRenderer.on('configSaved', this.onConfigSaved.bind(this));
    this.electronService.ipcRenderer.on('configSaveFail', this.onConfigSaveFail.bind(this));

    this.configService.saveConfig(config);
  }

  private onConfigSaveFail(_, errors: string[]) {
    this.notificationService.setWarning("Can't save invalid config", String(errors));
  }

  private onConfigSaved() {
    this.hideSettings();
    this.electronService.ipcRenderer.send('reload');
  }

  public showUpdate(): void {
    this.update = true;
  }

  public hideUpdate(): void {
    this.update = false;
  }
}
