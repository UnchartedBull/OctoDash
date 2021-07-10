import { Component, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { PrinterState, PrinterStatus, TemperatureReading } from '../model';
import { NotificationService } from '../notification/notification.service';
import { EnclosureService } from '../services/enclosure/enclosure.service';
import { ProfileService } from '../services/profiles/profiles.service';
import { SocketService } from '../services/socket/socket.service';

@Component({
  selector: 'app-bottom-bar',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss'],
})
export class BottomBarComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private printerReady = false;

  public printerStatus: PrinterState;
  public enclosureTemperature: TemperatureReading;
  public profiles:boolean = false;
  public PrinterName:String;
  public constructor(
    private socketService: SocketService,
    private configService: ConfigService,
    private enclosureService: EnclosureService,
    private notificationService: NotificationService,
    private profileService: ProfileService
  ) {
    if (this.configService.getAmbientTemperatureSensorName() !== null) {
      this.subscriptions.add(
        timer(2500, 15000).subscribe(() => {
          if (this.printerReady) {
            this.enclosureService.getEnclosureTemperature().subscribe(
              (temperatureReading: TemperatureReading) => (this.enclosureTemperature = temperatureReading),
              error => {
                this.notificationService.setError(
                  $localize`:@@error-enclosure-temp:Can't retrieve enclosure temperature!`,
                  error.message,
                );
              },
            );
          }
        }),
      );
    }
    this.subscriptions.add(
      this.socketService.getPrinterStatusSubscribable().subscribe((printerStatus: PrinterStatus): void => {
        this.printerStatus = printerStatus.status;
        if (!this.printerReady) {
          this.printerReady = [PrinterState.operational, PrinterState.printing, PrinterState.paused].includes(
            this.printerStatus,
          );
        }
      }),
    );
    this.getPrinterName();
  }

  public getStringStatus(printerState: PrinterState): string {
    return PrinterState[printerState];
  }

  public getPrinterName(): void {
    this.profileService.getActiveProfile().subscribe((profile)=>{
      this.PrinterName = profile.name;
    });
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public showProfiles(){
    if (this.printerStatus == PrinterState.operational){
      this.profiles = true;
    }
  }

  public hideProfiles(): void {
    setTimeout((): void => {
      this.profiles = false;
      this.getPrinterName();
    }, 350);
  }
}
