import { Component, OnInit } from '@angular/core';
import { HammerGestureConfig } from '@angular/platform-browser';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})

export class FilesComponent {

  constructor() {
  }

  openDetails(file: string) {
    console.log(file);
  }

  openFolder(foldername: string) {
    console.log(`opening ${foldername}`);
  }
}
