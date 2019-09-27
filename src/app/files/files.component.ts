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
    this.openFolder(this.currentFolder);
  }

  openDetails(file: string) {
    console.log(file);
    this.filesService.getFile(file).then((data) => {
      console.log(data);
    })
    const fileDOMElement = document.getElementById('fileDetailView');
    fileDOMElement.style.display = 'block';
    setTimeout(() => {
      fileDOMElement.style.opacity = '1';
    }, 50);
  }

  openFolder(foldername: string) {
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
        this.folderContent = data;
        this.currentFolder = foldername;
        this.spinner.hide();
      });
  }

  closeDetails() {
    const fileDOMElement = document.getElementById('fileDetailView');
    fileDOMElement.style.opacity = '0';
    setTimeout(() => {
      fileDOMElement.style.display = 'none';
    }, 500);
  }
}
