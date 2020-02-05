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
  public page = 0;
  public totalPages = 4;

  private configUpdate: boolean;
  public config: Config;
  public configErrors: string[];
  public configValid: boolean;
  public configSaved: string;

  public octoprintConnection: boolean;
  public octoprintConnectionError: string;

  public constructor(private configService: ConfigService, private http: HttpClient, private router: Router) {
    this.configUpdate = this.configService.isUpdate();
    if (this.configUpdate) {
      this.config = configService.getCurrentConfig();
    } else {
      this.config = {
        octoprint: {
          url: 'http://localhost:5000/api/',
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
    this.config = this.configService.revertConfigForInput(this.config);
  }

  public ngOnInit(): void {
    this.changeProgress();
  }

  public testOctoprintAPI(): boolean {
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

  public createConfig(): boolean {
    this.configErrors = [];
    this.octoprintConnectionError = null;
    this.config = this.configService.createConfigFromInput(this.config);
    this.validateConfig();
    return true;
  }

  public validateConfig(): void {
    this.configValid = this.configService.validateGiven(this.config);
    if (!this.configValid) {
      this.configErrors = this.configService.getErrors();
    } else {
      this.testOctoprintAPI();
    }
  }

  public saveConfig(): void {
    this.configSaved = this.configService.saveConfig(this.config);
  }

  public finishWizard(): void {
    this.configService.updateConfig();
    this.router.navigate(['/main-screen']);
  }

  public increasePage(): void {
    this.page += 1;
    if (this.page === 4) {
      this.createConfig();
    }
    this.changeProgress();
  }

  public decreasePage(): void {
    if (this.page === 4) {
      this.config = this.configService.revertConfigForInput(this.config);
    }
    this.page -= 1;
    this.changeProgress();
  }

  public changeProgress(): void {
    document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
  }
}
