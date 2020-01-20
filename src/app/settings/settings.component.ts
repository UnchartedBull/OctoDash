import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { ConfigService, Config } from '../config/config.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() closeFunction = new EventEmitter<string>();
  @ViewChild('settingsMain', { static: false }) settingsMain: ElementRef;
  @ViewChild('settingsGeneral', { static: false }) settingsGeneral: ElementRef;
  @ViewChild('settingsOctoDash', { static: false }) settingsOctoDash: ElementRef;
  @ViewChild('settingsPlugins', { static: false }) settingsPlugins: ElementRef;
  @ViewChild('settingsCredits', { static: false }) settingsCredits: ElementRef;

  public fadeOutAnimation = false;
  public config: Config;
  private pages = [];

  public constructor(private configService: ConfigService) {
    this.config = configService.getCurrentConfig();
    this.config = this.configService.revertConfigForInput(this.config);
  }

  public ngOnInit(): void {
    setTimeout(() => {
      this.pages = [
        this.settingsMain.nativeElement,
        this.settingsGeneral.nativeElement,
        this.settingsOctoDash.nativeElement,
        this.settingsPlugins.nativeElement,
        this.settingsCredits.nativeElement];
    }, 400);
  }

  public hideSettings(): void {
    this.fadeOutAnimation = true;
    this.closeFunction.emit();
    setTimeout(() => {
      this.fadeOutAnimation = false;
    }, 800);
  }

  public changePage(page: number, current: number, direction: 'forward' | 'backward'): void {
    this.pages[current].classList.add('settings__content-slideout-' + direction);
    this.pages[page].classList.remove('settings__content-inactive');
    this.pages[page].classList.add('settings__content-slidein-' + direction);

    setTimeout(() => {
      this.pages[current].classList.add('settings__content-inactive');
      this.pages[current].classList.remove('settings__content-slideout-' + direction);
      this.pages[page].classList.remove('settings__content-slidein-' + direction);
    }, 750);
  }

}
