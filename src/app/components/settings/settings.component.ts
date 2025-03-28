import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';

import { NotificationType, URLSplit } from '../../model';
import { ConfigSchema as Config } from '../../model/config.model';
import { AppService } from '../../services/app.service';
import { ConfigService } from '../../services/config.service';
import { ElectronService } from '../../services/electron.service';
import { NotificationService } from '../../services/notification.service';
import { SystemService } from '../../services/system/system.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: false,
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
  public octoprintURL: URLSplit;
  public customActionsPosition = [
    $localize`:@@top-left:Top Left`,
    $localize`:@@top-right:Top Right`,
    $localize`:@@middle-left:Middle Left`,
    $localize`:@@middle-right:Middle Right`,
    $localize`:@@bottom-left:Bottom Left`,
    $localize`:@@bottom-right:Bottom Right`,
  ];
  private overwriteNoSave = false;
  private pages = [];
  public update = false;
  public reset = false;

  public localIpAddress$;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private electronService: ElectronService,
    private systemService: SystemService,
    public service: AppService,
  ) {
    this.config = this.configService.getCurrentConfig();
    this.octoprintURL = this.configService.splitOctoprintURL(this.config.octoprint.url);
    this.localIpAddress$ = this.systemService.getLocalIpAddress();
  }

  public ngOnInit(): void {
    const currentCommands = this.config.octodash.customActions.length;
    for (let i = currentCommands; i < 6; i++) {
      this.config.octodash.customActions.push({
        icon: 'mdi mdi-plus',
        command: '',
        color: '#ffffff',
        confirm: false,
        exit: false,
      });
    }
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
    this.electronService.removeListener('configSaved', this.onConfigSaved.bind(this));
    this.electronService.removeListener('configSaveFail', this.onConfigSaveFail.bind(this));
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
      this.notificationService.setNotification({
        heading: $localize`:@@conf-unsaved:Configuration not saved!`,
        // eslint-disable-next-line max-len
        text: $localize`:@@conf-unsaved-message:You haven't saved your config yet, so your changes will not be applied. Click close again if you want to discard your changes!`,
        type: NotificationType.WARN,
        time: new Date(),
      });
      this.overwriteNoSave = true;
    }
  }

  public stopPropagation(event: Event): void {
    event.stopPropagation();
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
    this.config.octoprint.url = this.configService.mergeOctoprintURL(this.octoprintURL);
    const config = this.configService.createConfigFromInput(this.config);

    this.electronService.on('configSaved', this.onConfigSaved.bind(this));
    this.electronService.on('configSaveFail', this.onConfigSaveFail.bind(this));

    this.configService.saveConfig(config);
  }

  private onConfigSaveFail(_, errors: string[]) {
    this.notificationService.setNotification({
      heading: $localize`:@@error-invalid-config:Can't save invalid config`,
      text: String(errors),
      type: NotificationType.WARN,
      time: new Date(),
    });
  }

  private onConfigSaved() {
    this.hideSettings();
    this.electronService.send('reload');
  }

  public showUpdate(): void {
    this.update = true;
  }

  public hideUpdate(): void {
    this.update = false;
  }

  public showReset(): void {
    this.reset = true;
  }

  public hideReset(): void {
    this.reset = false;
  }
}
