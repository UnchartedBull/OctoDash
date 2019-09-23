import { Component } from '@angular/core';
import { FilesService, Folder } from '../files.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})

export class FilesComponent {

  currentFolder: string;
  folderContent: Array<File | Folder>;

  constructor(private filesService: FilesService) {
    this.currentFolder = '/';
    this.openFolder(this.currentFolder);
  }

  openDetails(file: string) {
    console.log(file);
  }

  openFolder(foldername: string) {
    console.log(`opening ${foldername}`);
    this.filesService.getFolder(foldername).then((data) => this.folderContent = data).catch((reason: string) => null);
  }
}
