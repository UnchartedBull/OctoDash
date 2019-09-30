import { Component } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { FilesService, Folder } from '../files.service';
import { AppService } from '../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})

export class FilesComponent {

  currentFolder: string;
  folderContent: Array<File | Folder>;
  fileDetail: File;

  constructor(private filesService: FilesService, private spinner: NgxSpinnerService, private service: AppService, private router: Router) {
    this.currentFolder = '/';
    this.openFolder(this.currentFolder);
  }

  public openDetails(filePath: string): void {
    this.filesService.getFile(filePath).then((data) => {
      this.fileDetail = data;
    }).catch((err) => {
      this.fileDetail = { name: 'error' } as File;
    });
    const fileDOMElement = document.getElementById('fileDetailView');
    fileDOMElement.style.display = 'block';
    setTimeout(() => {
      fileDOMElement.style.opacity = '1';
    }, 50);
  }

  public openFolder(folderPath: string): void {
    this.spinner.show(undefined, {
      bdColor: '#353b48',
      color: '#f5f6fa',
      size: 'medium',
      type: 'pacman',
      fullScreen: false
    });
    this.folderContent = null;
    this.filesService.getFolder(folderPath).then(
      (data) => {
        this.folderContent = data;
        this.currentFolder = folderPath;
        this.spinner.hide();
      }).catch((err) => {
        this.folderContent = null;
        this.currentFolder = folderPath;
        this.spinner.hide();
      });
  }

  public closeDetails(): void {
    const fileDOMElement = document.getElementById('fileDetailView');
    fileDOMElement.style.opacity = '0';
    setTimeout(() => {
      fileDOMElement.style.display = 'none';
      this.fileDetail = null;
    }, 500);
  }

  loadFile() {
    // TODO: Octoprint Load File
    this.service.setLoadedFile(true);
    this.router.navigate(['/main-screen']);
  }
}
