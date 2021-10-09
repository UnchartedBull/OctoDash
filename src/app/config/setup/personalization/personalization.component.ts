import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { PersonalizationService } from './personalization.service';

@Component({
  selector: 'app-config-setup-personalization',
  templateUrl: './personalization.component.html',
  styleUrls: ['./personalization.component.scss', '../setup.component.scss'],
})
export class PersonalizationComponent implements OnInit {
  @Input() printerName: string;
  @Input() useTouchscreen: boolean;
  @Input() octoprintURL: string;
  @Input() apiKey: string;

  @Output() printerNameChange = new EventEmitter<string>();
  @Output() useTouchscreenChange = new EventEmitter<boolean>();

  constructor(private personalizationService: PersonalizationService) {}

  ngOnInit(): void {
    this.personalizationService
      .getActivePrinterProfileName(this.octoprintURL, this.apiKey)
      .subscribe((printerName: string) => {
        if (!this.printerName) {
          this.printerName = printerName;
          this.printerNameChange.emit(this.printerName);
        }
      });
  }

  changeUseTouchscreen(): void {
    this.useTouchscreen = !this.useTouchscreen;
    this.useTouchscreenChange.emit(this.useTouchscreen);
  }
}
