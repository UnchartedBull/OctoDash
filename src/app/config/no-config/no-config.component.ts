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

  urlName: string;
  urlPort: number;

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
      this.revertConfigForUserInput();
    } else {
      this.config = {
        octoprint: {
          url: 'http://localhost:5000',
          accessToken: '',
          apiInterval: 1500
        },
        printer: {
          name: '',
          xySpeed: 150,
          zSpeed: 5
        },
        filament: {
          thickness: 1.75,
          density: 1.25
        },
        octodash: {
          touchscreen: true,
          temperatureSensor: {
            ambient: null,
            filament1: null,
            filament2: null
          },
          customActions: [
            {
              icon: 'home',
              command: 'G28',
              color: '#dcdde1'
            },
            {
              icon: 'ruler-vertical',
              command: 'G29',
              color: '#44bd32'
            },
            {
              icon: 'fire-alt',
              command: 'M140 S50; M104 S185',
              color: '#e1b12c'
            },
            {
              icon: 'snowflake',
              command: 'M140 S0; M104 S0',
              color: '#0097e6'
            },
            {
              icon: 'redo-alt',
              command: '[!RELOAD]',
              color: '#7f8fa6'
            },
            {
              icon: 'skull',
              command: '[!KILL]',
              color: '#e84118'
            }
          ],
          turnScreenOffSleep: false
        }
      };
    }
    this.urlName = this.config.octoprint.url.split(':')[1].replace('//', '');
    this.urlPort = parseInt(this.config.octoprint.url.split(':')[2], 10);
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
      () => {
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
    this.config.octoprint.url = `http://${this.urlName}:${this.urlPort}/api/`;
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
      this.revertConfigForUserInput();
    }
    this.page -= 1;
    this.changeProgress();
  }

  private revertConfigForUserInput() {
    this.config.octoprint.url = this.config.octoprint.url.replace('/api/', '');
  }

  changeProgress() {
    document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
  }
}
