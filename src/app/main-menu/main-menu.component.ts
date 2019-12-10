import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {

  public settings = true;

  public showSettings() {
    this.settings = true;
  }

  public hideSettings() {
    setTimeout(() => {
      this.settings = false;
    }, 600);
  }

  constructor() { }

  ngOnInit() {
  }

}
