import { Component, OnInit } from '@angular/core';
import { Config, ConfigService } from '../config.service';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-config',
  templateUrl: './no-config.component.html',
  styleUrls: ['./no-config.component.scss']
})
export class NoConfigComponent implements OnInit {
  page = 0;
  totalPages = 4;

  configUpdate: boolean;
  config: Config;
  configErrors: string[];
  configValid: boolean;
  configSaved: string;

  octoprintConnection: boolean;
  octoprintConnectionError: string;

  constructor(private configService: ConfigService, private http: HttpClient, private router: Router) {
    this.configUpdate = this.configService.isUpdate();
    if (this.configUpdate) {
      this.config = configService.getRemoteConfig();
      this.config.octoprint.url = this.config.octoprint.url.replace('/api/', '');
      // Insert automated fix from here
      this.config.octodash = {
        touchscreen: this.config.touchscreen,
        temperatureSensor: {
          type: 0,
          gpio: null
        }
      };
      delete this.config.touchscreen;
    } else {
      this.config = {
        octoprint: {
          url: 'http://localhost:5000',
          accessToken: '',
          apiInterval: 1500
        },
        printer: {
          name: ''
        },
        filament: {
          thickness: 1.75,
          density: 1.25
        },
        octodash: {
          touchscreen: true,
          temperatureSensor: {
            type: 0,
            gpio: 0
          }
        }
      };
    }
  }

  ngOnInit() {
    this.changeProgress();
  }

  testOctoprintAPI() {
    const httpHeaders = {
      headers: new HttpHeaders({
        'x-api-key': this.config.octoprint.accessToken
      })
    };
    this.http.get(this.config.octoprint.url + 'version', httpHeaders).subscribe(
      (data: JSON) => {
        this.octoprintConnection = true;
        this.saveConfig();
      },
      (error: HttpErrorResponse) => {
        this.octoprintConnection = false;
        this.octoprintConnectionError = error.message;
      }
    );
    return true;
  }

  createConfig() {
    this.configErrors = [];
    this.octoprintConnectionError = null;
    this.config.octoprint.url = this.config.octoprint.url + '/api/';
    if (this.config.octodash.temperatureSensor.type === 0) {
      this.config.octodash.temperatureSensor = null;
    }
    this.validateConfig();
    return true;
  }

  validateConfig() {
    this.configValid = this.configService.validateGiven(this.config);
    if (!this.configValid) {
      this.configErrors = this.configService.getErrors();
    } else {
      this.testOctoprintAPI();
    }
  }

  saveConfig() {
    this.configSaved = this.configService.saveConfig(this.config);
  }

  finishWizard() {
    this.configService.updateConfig();
    this.router.navigate(['/main-screen']);
  }

  increasePage() {
    this.page += 1;
    if (this.page === 4) {
      this.createConfig();
    }
    this.changeProgress();
  }

  decreasePage() {
    if (this.page === 4) {
      this.config.octoprint.url = this.config.octoprint.url.replace('/api/', '');
      this.config.octodash.temperatureSensor = {
        type: 0,
        gpio: 0
      };
    }
    this.page -= 1;
    this.changeProgress();
  }

  changeProgress() {
    document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
  }
}
