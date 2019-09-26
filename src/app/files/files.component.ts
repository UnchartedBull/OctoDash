import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilesService, Folder } from '../files.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})

export class FilesComponent {

  currentFolder: string;
  folderContent: Array<File | Folder>;

  constructor(private filesService: FilesService, private spinner: NgxSpinnerService) {
    this.currentFolder = '/';
    this.currentFolder = '/kingkong/src/abc';
    this.openFolder(this.currentFolder);
  }

  openDetails(file: string) {
    console.log(file);
    const fileDOMElement = document.getElementById('fileDetailView');
    fileDOMElement.style.display = 'block';
    setTimeout(() => {
      fileDOMElement.style.opacity = '1';
    }, 50);
  }

  openFolder(foldername: string) {
    // TODO
    this.spinner.show(undefined, {
      bdColor: '#353b48',
      color: '#f5f6fa',
      size: 'medium',
      type: 'pacman',
      fullScreen: false
    });
    this.folderContent = null;
    this.filesService.getFolder(foldername).then(
      (data) => {
        this.spinner.hide();
        this.folderContent = data;
        this.currentFolder = foldername;
      }).catch((reason: string) => this.spinner.hide());
  }

  closeDetails() {
    const fileDOMElement = document.getElementById('fileDetailView');
    fileDOMElement.style.opacity = '0';
    setTimeout(() => {
      fileDOMElement.style.display = 'none';
    }, 500);
  }
}
