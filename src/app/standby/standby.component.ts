import { Component, OnDestroy, OnInit } from '@angular/core';

import { AppService } from '../app.service';
import { ConfigService } from '../config/config.service';
import { PSUState } from '../model';
import { EnclosureService } from '../services/enclosure/enclosure.service';
import { SystemService } from '../services/system/system.service';

@Component({
  selector: 'app-standby',
  templateUrl: './standby.component.html',
  styleUrls: ['./standby.component.scss'],
})
export class StandbyComponent implements OnInit, OnDestroy {
  public connecting = false;
  public showConnectionError = false;
  private displaySleepTimeout: ReturnType<typeof setTimeout>;
  private connectErrorTimeout: ReturnType<typeof setTimeout>;

  public constructor(
    private configService: ConfigService,
    private service: AppService,
    private enclosureService: EnclosureService,
    private systemService: SystemService,
  ) {}

  public ngOnInit(): void {
    setTimeout(() => {
      if (this.configService.getAutomaticScreenSleep()) {
        this.displaySleepTimeout = setTimeout(this.service.turnDisplayOff.bind(this.service), 300000);
      }
    });
  }

  public ngOnDestroy(): void {
    clearTimeout(this.displaySleepTimeout);
    clearTimeout(this.connectErrorTimeout);
    if (this.configService.getAutomaticScreenSleep()) {
      this.service.turnDisplayOn();
    }
  }

  public reconnect(): void {
    this.connecting = true;
    if (this.configService.getAutomaticPrinterPowerOn()) {
      this.enclosureService.setPSUState(PSUState.ON);
      setTimeout(this.connectPrinter.bind(this), 5000);
    } else {
      this.connectPrinter();
    }
  }

  private connectPrinter(): void {
    this.systemService.connectPrinter();
    this.connectErrorTimeout = setTimeout(() => {
      this.showConnectionError = true;
      this.connectErrorTimeout = setTimeout(() => {
        this.showConnectionError = false;
        this.connecting = false;
      }, 30000);
    }, 15000);
  }
}
