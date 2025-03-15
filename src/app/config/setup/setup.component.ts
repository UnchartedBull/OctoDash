import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'src/app/electron.service';

import { defaultConfig } from '../config.default';
import { Config } from '../config.model';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-config-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class ConfigSetupComponent implements OnInit, OnDestroy {
  public page = 0;
  public totalPages = 6;

  public configUpdate: boolean;
  public config: Config;

  public octoprintConnection = false;
  public configValid = false;
  public configSaved = $localize`:@@saving-config:saving config`;
  public configErrors: string[];

  public manualURL = false;

  public constructor(
    private configService: ConfigService,
    private http: HttpClient,
    private router: Router,
    private electronService: ElectronService,
    private zone: NgZone,
  ) {
    this.configUpdate = this.configService.isUpdate();
    if (this.configUpdate) {
      this.config = configService.getCurrentConfig();
    } else {
      this.config = defaultConfig;
    }
    this.config.octoprint.urlSplit = this.configService.splitOctoprintURL(this.config.octoprint.url);
  }

  public ngOnInit(): void {
    this.changeProgress();
  }

  public ngOnDestroy(): void {
    this.electronService.removeListener('configSaved', this.onConfigSaved.bind(this));
    this.electronService.removeListener('configSaveFail', this.onConfigSaveFail.bind(this));
  }

  public changeURLEntryMethod(manual: boolean): void {
    this.manualURL = manual;
  }

  public getOctoprintURL(): string {
    return this.configService.mergeOctoprintURL(this.config.octoprint.urlSplit);
  }

  public createConfig(): void {
    this.configErrors = [];
    this.config = this.configService.createConfigFromInput(this.config);
    this.checkOctoPrintConnection();
  }

  private checkOctoPrintConnection(): void {
    const httpHeaders = {
      headers: new HttpHeaders({
        'x-api-key': this.config.octoprint.accessToken,
      }),
    };

    this.http.get(`${this.config.octoprint.url}api/version`, httpHeaders).subscribe({
      next: () => {
        this.octoprintConnection = true;
        this.saveConfig();
      },
      error: (error: HttpErrorResponse): void => {
        this.octoprintConnection = false;
        if (error.message.includes('403 FORBIDDEN')) {
          this.configErrors.push(
            $localize`:@@error-403:403 Forbidden - This most likely means that your API Key isn't working.`,
          );
        } else if (error.message.includes('0 Unknown Error')) {
          this.configErrors.push(
            $localize`:@@error-unknown:0 Unknown Error - This most likely means that your OctoPrint host and port aren't correct.`,
          );
        } else {
          this.configErrors.push(error.message);
        }
      },
    });
  }

  private onConfigSaved() {
    this.zone.run(() => {
      this.configValid = true;
      this.configSaved = null;
    });
  }

  private onConfigSaveFail(_, errors) {
    this.zone.run(() => {
      this.configValid = false;

      this.configErrors = errors;
    });
  }

  private saveConfig(): void {
    this.electronService.on('configSaved', this.onConfigSaved.bind(this));
    this.electronService.on('configSaveFail', this.onConfigSaveFail.bind(this));

    this.configService.saveConfig(this.config);
  }

  public finishWizard(): void {
    this.electronService.send('reload');
  }

  private changePage(value: number): void {
    if (this.page + value > this.totalPages || this.page + value < 0) {
      return;
    }
    this.page += value;
    this.changeProgress();
  }

  public increasePage(): void {
    if (this.page === this.totalPages - 1) {
      this.createConfig();
    }
    this.changePage(1);
  }

  public decreasePage(): void {
    if (this.page === this.totalPages) {
      this.config.octoprint.urlSplit = this.configService.splitOctoprintURL(this.config.octoprint.url);
    }
    this.changePage(-1);
  }

  public changeProgress(): void {
    document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
  }
}
