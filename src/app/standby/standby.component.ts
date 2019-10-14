import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-standby',
  templateUrl: './standby.component.html',
  styleUrls: ['./standby.component.scss']
})
export class StandbyComponent implements OnInit {

  error: string = "OctoPrint can't connect to your printer. Please make sure that the connection works, then come back and try again."

  constructor() { }

  ngOnInit() {

  }
}
