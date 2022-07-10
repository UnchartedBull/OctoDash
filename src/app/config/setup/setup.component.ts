import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'src/app/electron.service';
import { UrlHelper } from 'src/app/helper/url.helper';

import { getDefaultConfig } from '../config.default';
import { BackendType, Config, URLSplit as UrlSplit } from '../config.model';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-config-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
})
export class ConfigSetupComponent implements OnInit, OnDestroy {
  public page = 0;
  public totalPages = 7;

  public configUpdate: boolean;
  public config: Config;

  public backendConnection = false;
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
    }
  }

  public ngOnInit(): void {
    this.changeProgress();
  }

  public ngOnDestroy(): void {
    this.electronService.removeListener('configSaved', this.onConfigSaved.bind(this));
    this.electronService.removeListener('configSaveFail', this.onConfigSaveFail.bind(this));
  }

  public useNewConfig(config: Config): void {
    this.config = config;
  }

  public hasOctoprintBackend(): boolean {
    return this.config.backend.type === BackendType.OCTOPRINT;
  }

  public hasMoonrakerBackend(): boolean {
    return this.config.backend.type === BackendType.MOONRAKER;
  }

  public splitUrl(url: string): UrlSplit {
    return UrlHelper.splitUrl(url);
  }

  public showBackButton(): boolean {
    return this.page > 0;
  }

  public showNextButton(): boolean {
    return !(this.page === this.totalPages || (this.page === 2 && !this.manualURL) || this.page === 1);
  }

  public changeURLEntryMethod(manual: boolean): void {
    this.manualURL = manual;
  }

  public createConfig(): void {
    this.configErrors = [];
    this.checkBackendConnection();
  }

  private checkBackendConnection(): void {
    const httpHeaders = {
      headers: new HttpHeaders({
        'x-api-key': this.config.backend.accessToken,
      }),
    };
    let url;
    if (this.config.backend.type === BackendType.OCTOPRINT) {
      url = `${this.config.backend.url}/api/version`;
    } else {
      url = `${this.config.backend.url}/machine/system_info`;
    }
    this.http.get(url, httpHeaders).subscribe({
      next: () => {
        this.backendConnection = true;
        this.saveConfig();
      },
      error: (error: HttpErrorResponse): void => {
        this.backendConnection = false;
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
    setTimeout(() => {
      if (this.page === 0 && this.config) {
        return this.changePage(2);
      } else if (this.page === 5 && this.config.backend.type === BackendType.MOONRAKER) {
        return this.changePage(2);
      }
      this.changePage(1);
      if (this.page === 7) {
        this.createConfig();
      }
    }, 200);
  }

  public decreasePage(): void {
    console.log(this.config);
    setTimeout(() => {
      if (this.page === 7 && this.config.backend.type === BackendType.MOONRAKER) {
        return this.changePage(-2);
      }
      this.changePage(-1);
    }, 200);
  }

  public changeProgress(): void {
    document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
  }
}
