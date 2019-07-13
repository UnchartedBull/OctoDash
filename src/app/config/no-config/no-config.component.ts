import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-config',
  templateUrl: './no-config.component.html',
  styleUrls: ['./no-config.component.scss']
})
export class NoConfigComponent implements OnInit {
  page = 1;
  totalPages = 3;

  constructor() { }

  ngOnInit() {
    this.changeProgress()
  }

  increasePage() {
    this.page += 1;
    this.changeProgress()
  }

  decreasePage() {
    this.page -= 1;
    this.changeProgress()
  }

  changeProgress() {
    document.getElementById('progressBar').style.width = this.page * (20 / this.totalPages) + 'vw';
  }

}
