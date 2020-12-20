import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PrinterProfileService } from 'src/app/printerprofile.service';
import { BasicAuth } from '../../config.model';

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
  @Input() basicAuth: BasicAuth;

  @Output() printerNameChange = new EventEmitter<string>();
  @Output() useTouchscreenChange = new EventEmitter<boolean>();

  constructor(private printerProfileService: PrinterProfileService) {}

  ngOnInit(): void {
    this.printerProfileService.getActivePrinterProfileName(this.octoprintURL, this.apiKey, this.basicAuth).subscribe(printerName => {
      if (!this.printerName) {
        this.printerName = printerName;
        this.printerNameChange.emit(this.printerName);
      }
    });
    console.log(this.basicAuth);
  }

  changeUseTouchscreen(): void {
    this.useTouchscreen = !this.useTouchscreen;
    this.useTouchscreenChange.emit(this.useTouchscreen);
  }
}
