import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-config',
  templateUrl: './no-config.component.html',
  styleUrls: ['./no-config.component.scss']
})
export class NoConfigComponent implements OnInit {
  page = 4;
  totalPages = 4;

  printerName = '';
  filamentDiameter = 1.75;
  filamentDensity = 1.25;
  octoprintURL = 'http://localhost:5000';
  accessToken = '';
  touchscreen = true;

  constructor() { }

  ngOnInit() {
    this.changeProgress();
  }

  increasePage() {
    this.page += 1;
    this.changeProgress();
  }

  decreasePage() {
    this.page -= 1;
    this.changeProgress();
  }

  changeProgress() {
    document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
  }

}
