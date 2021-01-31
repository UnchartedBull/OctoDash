import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { ConfigService } from '../config/config.service';
import { File, FilesService, Folder } from '../files.service';
import { JobService } from '../job.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
})
export class FilesComponent {
  public currentFolder: string;
  public folderContent: (File | Folder)[];
  public fileDetail: File;
  public sortingAttribute: 'name' | 'date' | 'size';
  public sortingOrder: 'asc' | 'dsc';
  public showSorting = false;
  public homeFolder = '/';

  public constructor(
    private _filesService: FilesService,
    private _spinner: NgxSpinnerService,
    private _router: Router,
    private _jobService: JobService,
    private _configService: ConfigService,
  ) {
    this.showLoader();
    this.folderContent = [];
    this.currentFolder = '/';
    this.sortingAttribute = this._configService.getDefaultSortingAttribute();
    this.sortingOrder = this._configService.getDefaultSortingOrder();
    this.openFolder(this.currentFolder);
  }

  public openDetails(filePath: string): void {
    this._filesService
      .getFile(filePath)
      .then((data): void => {
        this.fileDetail = data;
      })
      .catch((): void => {
        this.fileDetail = ({ name: 'error' } as unknown) as File;
      });
    const fileDOMElement = document.getElementById('fileDetailView');
    fileDOMElement.style.display = 'block';
    setTimeout((): void => {
      fileDOMElement.style.opacity = '1';
    }, 50);
  }

  public openFolder(folderPath: string): void {
    setTimeout((): void => {
      this.showLoader();
      this.folderContent = [];
      this._filesService
        .getFolder(folderPath)
        .then((data): void => {
          this.folderContent = data;
          if (folderPath === '/' && !(data[0].name === 'local' && data[1].name == 'sdcard')) {
            this.currentFolder = data[0].path.startsWith('/local') ? '/local' : '/sdcard';
            this.homeFolder = this.currentFolder;
          } else {
            this.currentFolder = folderPath;
          }
          this.sortFolder(this.sortingAttribute, this.sortingOrder);
          this._spinner.hide();
        })
        .catch((): void => {
          this.folderContent = null;
          this.currentFolder = folderPath;
          this._spinner.hide();
        });
    }, 300);
  }

  public sortFolder(by: 'name' | 'date' | 'size' = 'name', order: 'asc' | 'dsc' = 'asc'): void {
    switch (by) {
      case 'name': {
        this.folderContent.sort((a, b): number =>
          a.type === b.type
            ? (order === 'asc' ? a.name > b.name : a.name < b.name)
              ? 1
              : -1
            : a.type === 'folder'
            ? -1
            : 1,
        );
        break;
      }
      case 'date': {
        this.sortFolder('name', order);
        this.folderContent.sort((a, b): number => {
          if (a.type === b.type && a.type === 'file') {
            const aFile = (a as unknown) as File;
            const bFile = (b as unknown) as File;
            return (order === 'asc' ? aFile.date > bFile.date : aFile.date < bFile.date) ? 1 : -1;
          } else {
            return a.type === 'folder' ? -1 : 1;
          }
        });
        break;
      }
      case 'size': {
        this.sortFolder('name', order);
        this.folderContent.sort((a, b): number => {
          if (a.type === b.type && (a as File).type) {
            const aFile = (a as unknown) as File;
            const bFile = (b as unknown) as File;
            return (order === 'asc' ? aFile.size > bFile.size : aFile.size < bFile.size) ? 1 : -1;
          } else {
            return 1;
          }
        });
        break;
      }
    }
  }

  public closeDetails(): void {
    const fileDOMElement = document.getElementById('fileDetailView');
    fileDOMElement.style.opacity = '0';
    setTimeout((): void => {
      fileDOMElement.style.display = 'none';
      this.fileDetail = null;
    }, 500);
  }

  public openSorting(): void {
    this.showSorting = true;
    setTimeout((): void => {
      const sortingDOMElement = document.getElementById('sortingView');
      sortingDOMElement.style.opacity = '1';
    }, 50);
  }

  public closeSorting(): void {
    const sortingDOMElement = document.getElementById('sortingView');
    sortingDOMElement.style.opacity = '0';
    this.sortFolder(this.sortingAttribute, this.sortingOrder);
    setTimeout((): void => {
      sortingDOMElement.style.display = 'none';
      this.showSorting = false;
    }, 500);
  }

  public loadFile(filePath: string): void {
    setTimeout((): void => {
      this._filesService.loadFile(filePath);
      this._filesService.loadedFile = true;
      this._jobService.deleteJobInformation();
      this._router.navigate(['/main-screen']);
    }, 300);
  }

  public printFile(filePath: string): void {
    setTimeout((): void => {
      this._filesService.printFile(filePath);
      this._router.navigate(['/main-screen']);
    }, 300);
  }

  public deleteFile(filePath: string): void {
    setTimeout((): void => {
      this._filesService.deleteFile(filePath);
      this.closeDetails();
      this.openFolder(this.currentFolder);
    }, 300);
  }

  private showLoader(): void {
    this._spinner.show(undefined, {
      bdColor: '#353b48',
      color: '#f5f6fa',
      size: 'medium',
      type: 'pacman',
      fullScreen: false,
    });
  }
}
