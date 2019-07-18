import { Component, OnInit } from '@angular/core';
import { Config, ConfigService } from '../config.service';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';

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

  constructor(private configService: ConfigService, private http: HttpClient) {
    this.configUpdate = this.configService.update;
    if (this.configUpdate) {
      this.config = configService.getRemoteConfig();
      this.config.octodash = {
        touchscreen: this.config.touchscreen,
        temperatureSensor: null
      };
      delete this.config.touchscreen;
      console.log(this.config);
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
          temperatureSensor: null
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
  }

  increasePage() {
    this.page += 1;
    if (this.page === 4) {
      this.createConfig();
    }
    this.changeProgress();
  }

  decreasePage() {
    this.page -= 1;
    this.changeProgress();
  }

  changeProgress() {
    document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
  }

}
