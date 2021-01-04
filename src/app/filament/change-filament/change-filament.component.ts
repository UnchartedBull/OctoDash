import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfigService } from 'src/app/config/config.service';
import { FilamentSpool } from 'src/app/plugins';
import { PrinterService } from 'src/app/printer.service';

@Component({
  selector: 'app-filament-change-filament',
  templateUrl: './change-filament.component.html',
  styleUrls: [
    './change-filament.component.scss',
    '../filament.component.scss',
    '../heat-nozzle/heat-nozzle.component.scss',
  ],
})
export class ChangeFilamentComponent implements OnInit {
  @Input() selectedSpool: FilamentSpool;

  @Output() increasePage = new EventEmitter<void>();

  constructor(private configService: ConfigService, private printerService: PrinterService) {}

  ngOnInit(): void {
    if (this.configService.useM600()) {
      this.initiateM600FilamentChange();
    } else {
      this.disableExtruderStepper();
    }
  }

  private disableExtruderStepper(): void {
    this.printerService.executeGCode('M18 E ');
  }

  private initiateM600FilamentChange(): void {
    this.printerService.executeGCode('M600');
  }

  public getSpoolWeightLeft(weight: number, used: number): number {
    return Math.floor(weight - used);
  }

  public usingM600(): boolean {
    return this.configService.useM600();
  }
}
