import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { BackendType } from '../../config.model';
import { PersonalizationService } from './personalization.service';

@Component({
  selector: 'app-config-setup-personalization',
  templateUrl: './personalization.component.html',
  styleUrls: ['./personalization.component.scss', '../setup.component.scss'],
})
export class PersonalizationComponent implements OnInit {
  @Input() printerName: string;
  @Input() useTouchscreen: boolean;
  @Input() backendUrl: string;
  @Input() backendType: BackendType;
  @Input() apiKey: string;

  @Output() printerNameChange = new EventEmitter<string>();
  @Output() useTouchscreenChange = new EventEmitter<boolean>();

  constructor(private personalizationService: PersonalizationService) {}

  ngOnInit(): void {
    if (this.backendType === BackendType.OCTOPRINT) {
      this.personalizationService
        .getOctoprintActivePrinterProfileName(this.backendUrl, this.apiKey)
        .subscribe(this.updatePrinterName.bind(this));
    } else {
      this.personalizationService
        .getMoonrakerPrinterName(this.backendUrl, this.apiKey)
        .subscribe(this.updatePrinterName.bind(this));
    }
  }

  private updatePrinterName(printerName: string): void {
    if (!this.printerName) {
      this.printerName = printerName;
      this.printerNameChange.emit(this.printerName);
    }
  }

  changeUseTouchscreen(): void {
    this.useTouchscreen = !this.useTouchscreen;
    this.useTouchscreenChange.emit(this.useTouchscreen);
  }
}
