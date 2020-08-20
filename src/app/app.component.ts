import { Component } from "@angular/core";
import { Router } from "@angular/router";
import _ from "lodash";

import { AppService } from "./app.service";
import { ConfigService } from "./config/config.service";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    require: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process: any;
  }
}

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  public constructor(private configService: ConfigService, private service: AppService, private router: Router) {
    this.initialize();
  }

  private initialize(): void {
    if (this.configService && this.configService.isInitialized()) {
      if (this.configService.isLoaded()) {
        if (this.configService.isValid()) {
          if (this.configService.isTouchscreen()) {
            this.router.navigate(["/main-screen"]);
          } else {
            this.router.navigate(["/main-screen-no-touch"]);
          }
        } else {
          if (_.isEqual(this.configService.getErrors(), this.service.getUpdateError())) {
            if (this.service.autoFixError()) {
              this.initialize();
            } else {
              this.configService.setUpdate();
              this.router.navigate(["/no-config"]);
            }
          } else {
            this.router.navigate(["/invalid-config"]);
          }
        }
      } else {
        this.router.navigate(["/no-config"]);
      }
    } else {
      setTimeout(this.initialize.bind(this), 1000);
    }
  }
}
