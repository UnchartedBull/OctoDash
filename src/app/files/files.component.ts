import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

import { AppService } from '../app.service';
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
    private filesService: FilesService,
    private spinner: NgxSpinnerService,
    private service: AppService,
    private router: Router,
    private jobService: JobService,
    private configService: ConfigService,
  ) {
    this.showLoader();
    this.folderContent = [];
    this.currentFolder = '/';
    this.sortingAttribute = this.configService.getDefaultSortingAttribute();
    this.sortingOrder = this.configService.getDefaultSortingOrder();
    this.openFolder(this.currentFolder);
  }

  public openDetails(filePath: string): void {
    this.filesService
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
      this.filesService
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
          this.spinner.hide();
        })
        .catch((): void => {
          this.folderContent = null;
          this.currentFolder = folderPath;
          this.spinner.hide();
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
      this.filesService.loadFile(filePath);
      this.service.setLoadedFile(true);
      this.jobService.deleteJobInformation();
      this.router.navigate(['/main-screen']);
    }, 300);
  }

  public printFile(filePath: string): void {
    setTimeout((): void => {
      this.filesService.printFile(filePath);
      this.router.navigate(['/main-screen']);
    }, 300);
  }

  public deleteFile(filePath: string): void {
    setTimeout((): void => {
      this.filesService.deleteFile(filePath);
      this.closeDetails();
      this.openFolder(this.currentFolder);
    }, 300);
  }

  private showLoader(): void {
    this.spinner.show(undefined, {
      bdColor: '#353b48',
      color: '#f5f6fa',
      size: 'medium',
      type: 'pacman',
      fullScreen: false,
    });
  }
}
