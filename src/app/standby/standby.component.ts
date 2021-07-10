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
  public actionsVisible = false;
  public showConnectionError = false;
  private displaySleepTimeout: ReturnType<typeof setTimeout>;
  private connectErrorTimeout: ReturnType<typeof setTimeout>;
  title = 'clock-greets';
  time;
  hours;
  msg;
  public constructor(
    private configService: ConfigService,
    private service: AppService,
    private enclosureService: EnclosureService,
    private systemService: SystemService,
  ) {
    setInterval(() => {
      this.time = new Date();
      this.decide();
   }, 1000);

   this.decide();
  }
  decide() {
    this.hours = new Date().getHours();
    if(this.hours < 12){
      this.msg = "Good Morning"
    }else if(this.hours < 16){
      this.msg = "Good Afternoon"
    }else if(this.hours < 19){
      this.msg = "Good Evening"
    }else if(this.hours < 24){
      this.msg = "Good Night"
    }else if(this.hours < 6){
      this.msg = "Get some Sleep"
    }
  }

  public ngOnInit(): void {
    if (this.configService.getAutomaticScreenSleep()) {
      this.displaySleepTimeout = setTimeout(this.service.turnDisplayOff.bind(this.service), 300000);
    }
  }

  public ngOnDestroy(): void {
    clearTimeout(this.displaySleepTimeout);
    clearTimeout(this.connectErrorTimeout);
    if (this.configService.getAutomaticScreenSleep()) {
      this.service.turnDisplayOn();
    }
  }

  public reconnect(): void {
    this.actionsVisible = false;
    this.connecting = true;
    if (this.configService.getAutomaticPrinterPowerOn()) {
      this.enclosureService.setPSUState(PSUState.ON);
      setTimeout(this.connectPrinter.bind(this), 5000);
    } else {
      this.connectPrinter();
    }
  }

  private connectPrinter(): void {
    this.systemService.connectPrinter(null);
    this.connectErrorTimeout = setTimeout(() => {
      this.showConnectionError = true;
      this.connectErrorTimeout = setTimeout(() => {
        this.showConnectionError = false;
        this.connecting = false;
      }, 30000);
    }, 15000);
  }

  public toggleCustomActions(): void {
    this.actionsVisible = !this.actionsVisible;
  }
}
