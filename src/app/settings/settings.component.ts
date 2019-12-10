import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

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
  @ViewChild('settingsCustomActions', { static: false }) settingsCustomActions: ElementRef;
  @ViewChild('settingsCredits', { static: false }) settingsCredits: ElementRef;

  public fadeOutAnimation = false;
  private pages = [];

  constructor() {
  }

  ngOnInit() {
    setTimeout(() => {
      this.pages = [
        this.settingsMain.nativeElement,
        this.settingsGeneral.nativeElement,
        this.settingsOctoDash.nativeElement,
        this.settingsPlugins.nativeElement,
        this.settingsCustomActions.nativeElement,
        this.settingsCredits.nativeElement];
    }, 400);
  }

  hideSettings() {
    this.fadeOutAnimation = true;
    this.closeFunction.emit();
    setTimeout(() => {
      this.fadeOutAnimation = false;
    }, 800);
  }

  changePage(page: number, current: number, direction: 'forward' | 'backward') {
    this.pages[current].classList.add('settings__content-slideout-' + direction);
    this.pages[page].classList.remove('settings__content-inactive');
    this.pages[page].classList.add('settings__content-slidein-' + direction);

    setTimeout(() => {
      this.pages[current].classList.add('settings__content-inactive');
      this.pages[current].classList.remove('settings__content-slideout-' + direction);
      this.pages[page].classList.remove('settings__content-slidein-' + direction);
    }, 800);

    // this.settingsMain.nativeElement.classList.add('settings__content-slideout');
  }

}
