import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @Output() closeFunction = new EventEmitter<string>();

  public fadeOutAnimation = false;

  constructor() { }

  ngOnInit() {
  }

  hideSettings() {
    this.fadeOutAnimation = true;
    this.closeFunction.emit();
    setTimeout(() => {
      this.fadeOutAnimation = false;
    }, 800)
  }

}
