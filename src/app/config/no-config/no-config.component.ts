import { Component, OnInit } from '@angular/core';
import { Config, ConfigService } from '../config.service';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-no-config',
  templateUrl: './no-config.component.html',
  styleUrls: ['./no-config.component.scss']
})
export class NoConfigComponent implements OnInit {
  page = 3;
  totalPages = 4;

  printerName = '';
  filamentDiameter = 1.75;
  filamentDensity = 1.25;
  octoprintURL = 'http://localhost:5000';
  accessToken = '';
  touchscreen = true;

  config: Config;
  configErrors: string[];
  configValid: boolean;
  configSaved: string;
  octoprintConnection: boolean;
  octoprintConnectionError: string;

  constructor(private configService: ConfigService, private http: HttpClient) { }

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
    this.config = {
      octoprint: {
        url: this.octoprintURL + '/api/',
        accessToken: this.accessToken,
        apiInterval: 1500
      },
      printer: {
        name: this.printerName
      },
      filament: {
        density: this.filamentDensity,
        thickness: this.filamentDiameter
      },
      touchscreen: this.touchscreen
    };
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
    console.log(this.configSaved)
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
