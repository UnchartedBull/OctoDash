import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-config',
  templateUrl: './no-config.component.html',
  styleUrls: ['./no-config.component.scss']
})
export class NoConfigComponent implements OnInit {
  page = 1;

  constructor() { }

  ngOnInit() {
  }

}
