import { Component, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError } from 'rxjs';

import { URLSplit } from '../../model';
import { ConfigSchema as Config } from '../../model/config.model';
import { AppService } from '../../services/app.service';
import { ConfigService } from '../../services/config.service';
import { NotificationService } from '../../services/notification.service';
import { PluginsService } from '../../services/plugins.service';
import { SystemService } from '../../services/system/system.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: false,
})
export class SettingsComponent implements OnInit {
  @Output() closeFunction = new EventEmitter<void>();
  @ViewChild('settingsMain') private settingsMain: ElementRef;
  @ViewChild('settingsGeneral') private settingsGeneral: ElementRef;
  @ViewChild('settingsOctoDash') private settingsOctoDash: ElementRef;
  @ViewChild('settingsPlugins') private settingsPlugins: ElementRef;
  @ViewChild('settingsCredits') private settingsCredits: ElementRef;

  private pluginsService = inject(PluginsService);

  public enabledPlugins = toSignal(
    this.pluginsService.getEnabledPlugins().pipe(
      catchError(err => {
        this.notificationService.warn($localize`:@@error-fetching-plugins:Error fetching enabled plugins`, err.message);
        return [];
      }),
    ),
    { initialValue: [] },
  );

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
    private systemService: SystemService,
    public service: AppService,
  ) {
    this.config = this.configService.getCurrentConfig();
    this.localIpAddress$ = this.systemService.getLocalIpAddress();
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
      }, 5000);
    } else {
      this.notificationService.warn(
        $localize`:@@conf-unsaved:Configuration not saved!`,

        $localize`:@@conf-unsaved-message:You haven't saved your config yet, so your changes will not be applied. Click close again if you want to discard your changes!`,
      );
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
    const config = this.configService.createConfigFromInput(this.config);

    this.configService
      .saveConfig(config)
      .subscribe({ complete: this.onConfigSaved.bind(this), error: this.onConfigSaveFail.bind(this) });
  }

  private onConfigSaveFail(_, errors: string[]) {
    this.notificationService.warn($localize`:@@error-invalid-config:Can't save invalid config`, String(errors));
  }

  private onConfigSaved() {
    this.hideSettings();
    window.location.reload();
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
