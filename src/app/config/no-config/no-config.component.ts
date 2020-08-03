import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Config, ConfigService } from "../config.service";

@Component({
  selector: "app-no-config",
  templateUrl: "./no-config.component.html",
  styleUrls: ["./no-config.component.scss"],
})
export class NoConfigComponent implements OnInit {
  public page = 0;
  public totalPages = 6;

  private configUpdate: boolean;
  public config: Config;
  public configErrors: string[];
  public configValid: boolean;
  public configSaved: string;

  public octoprintConnection: boolean;
  public octoprintConnectionError: string;

  public constructor(private configService: ConfigService, private http: HttpClient, private router: Router) {
    this.configUpdate = this.configService.isUpdate();
    console.log(this.configUpdate);
    if (this.configUpdate) {
      this.config = configService.getCurrentConfig();
    } else {
      this.config = {
        octoprint: {
          url: "http://localhost:5000/api/",
          accessToken: "",
        },
        printer: {
          name: "",
          xySpeed: 150,
          zSpeed: 5,
          defaultTemperatureFanSpeed: {
            hotend: 200,
            heatbed: 60,
            fan: 100,
          },
        },
        filament: {
          thickness: 1.75,
          density: 1.25,
          feedLength: 0,
          feedSpeed: 30,
          feedSpeedSlow: 3,
          purgeDistance: 30,
          useM600: false,
        },
        plugins: {
          enclosure: {
            enabled: false,
            ambientSensorID: null,
            filament1SensorID: null,
            filament2SensorID: null,
          },
          filamentManager: {
            enabled: true,
          },
          preheatButton: {
            enabled: true,
          },
          printTimeGenius: {
            enabled: true,
          },
          psuControl: {
            enabled: false,
            turnOnPSUWhenExitingSleep: false,
          },
        },
        octodash: {
          customActions: [
            {
              icon: "home",
              command: "G28",
              color: "#dcdde1",
              confirm: false,
              exit: true,
            },
            {
              icon: "ruler-vertical",
              command: "G29",
              color: "#44bd32",
              confirm: false,
              exit: true,
            },
            {
              icon: "fire-alt",
              command: "M140 S50; M104 S185",
              color: "#e1b12c",
              confirm: false,
              exit: true,
            },
            {
              icon: "snowflake",
              command: "M140 S0; M104 S0",
              color: "#0097e6",
              confirm: false,
              exit: true,
            },
            {
              icon: "redo-alt",
              command: "[!RELOAD]",
              color: "#7f8fa6",
              confirm: true,
              exit: false,
            },
            {
              icon: "skull",
              command: "[!KILL]",
              color: "#e84118",
              confirm: true,
              exit: false,
            },
          ],
          fileSorting: {
            attribute: "name",
            order: "asc",
          },
          pollingInterval: 2000,
          touchscreen: true,
          turnScreenOffWhileSleeping: false,
          preferPreviewWhilePrinting: false,
        },
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
        "x-api-key": this.config.octoprint.accessToken,
      }),
    };
    this.http.get(this.config.octoprint.url + "connection", httpHeaders).subscribe(
      (): void => {
        this.octoprintConnection = true;
        this.saveConfig();
      },
      (error: HttpErrorResponse): void => {
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
    this.router.navigate(["/main-screen"]);
  }

  public increasePage(): void {
    this.page += 1;
    if (this.page === this.totalPages) {
      this.createConfig();
    }
    this.changeProgress();
  }

  public decreasePage(): void {
    if (this.page === 5) {
      this.config = this.configService.revertConfigForInput(this.config);
    }
    this.page -= 1;
    this.changeProgress();
  }

  public changeProgress(): void {
    document.getElementById("progressBar").style.width = this.page * (20 / this.totalPages) + "vw";
  }
}
