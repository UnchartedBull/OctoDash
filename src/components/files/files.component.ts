import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash-es';
import { AnimationOptions } from 'ngx-lottie';

import { Directory, File } from '../../model';
import { ConfigService } from '../../services/config.service';
import { FilesService } from '../../services/files/files.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss'],
  standalone: false,
})
export class FilesComponent {
  public currentFolder: string;
  public homeFolder = '/';
  public directory: Directory;
  public fileDetail: File;

  public sortingAttribute: 'name' | 'date' | 'size';
  public sortingOrder: 'asc' | 'dsc';
  public showSorting = false;

  public loadingOptions: AnimationOptions = {
    path: 'assets/animations/loading.json',
  };
  public loading = Date.now();

  public constructor(
    private filesService: FilesService,
    private notificationService: NotificationService,
    private router: Router,
    private configService: ConfigService,
  ) {
    this.showLoader();
    this.directory = { files: [], folders: [] };
    this.currentFolder = this.configService.getDefaultDirectory();

    this.sortingAttribute = this.configService.getDefaultSortingAttribute();
    this.sortingOrder = this.configService.getDefaultSortingOrder();

    this.openFolder(this.currentFolder);
  }

  public openFolder(folderPath: string): void {
    folderPath = folderPath === '' ? '/' : folderPath;
    setTimeout((): void => {
      this.showLoader();
      this.directory = { files: [], folders: [] };

      this.filesService.getFolderContent(folderPath).subscribe({
        next: (directory: Directory) => {
          this.directory = directory;
          const mergedDirectory = _.concat(directory.files, directory.folders);
          if (
            folderPath === '/' &&
            mergedDirectory.length > 0 &&
            !(mergedDirectory[0]?.name === 'local' && mergedDirectory[1]?.name == 'sdcard')
          ) {
            this.currentFolder = mergedDirectory[0]?.path.startsWith('/sdcard') ? '/sdcard' : '/local';
            this.homeFolder = this.currentFolder;
          } else {
            this.currentFolder = folderPath;
          }
          this.sortFolder(this.sortingAttribute, this.sortingOrder);
        },
        error: (error: HttpErrorResponse) => {
          this.notificationService.error($localize`:@@error-load-file-folder:Can't load file/folder!`, error.message);
          this.currentFolder = folderPath;
        },
        complete: () => {
          this.hideLoader();
        },
      });
    }, 240);
  }

  public setSortAttribute(attribute: 'name' | 'date' | 'size'): void {
    this.sortingAttribute = attribute;
    this.configService.setSortingAttribute(attribute);
  }

  public setSortOrder(order: 'asc' | 'dsc'): void {
    this.sortingOrder = order;
    this.configService.setSortingOrder(order);
  }

  public sortFolder(by: 'name' | 'date' | 'size' = 'name', order: 'asc' | 'dsc' = 'asc'): void {
    this.directory.folders.sort((a, b): number => ((order === 'asc' ? a.name > b.name : a.name < b.name) ? 1 : -1));
    this.directory.files.sort((a, b): number => ((order === 'asc' ? a[by] > b[by] : a[by] < b[by]) ? 1 : -1));
  }

  public openDetails(filePath: string): void {
    this.filesService.getFile(filePath).subscribe({
      next: (fileData: File) => (this.fileDetail = fileData),
      error: (error: HttpErrorResponse) => {
        this.fileDetail = { name: 'error' } as unknown as File;
        this.notificationService.error($localize`:@@error-load-file:Can't load file!`, error.message);
      },
    });
    const fileDOMElement = document.getElementById('fileDetailView');
    fileDOMElement.style.display = 'block';
    setTimeout((): void => {
      fileDOMElement.style.opacity = '1';
    }, 50);
  }

  public closeDetails(): void {
    const fileDOMElement = document.getElementById('fileDetailView');
    fileDOMElement.style.opacity = '0';
    setTimeout((): void => {
      fileDOMElement.style.display = 'none';
      this.fileDetail = null;
    }, 500);
  }

  public stopPropagation(event: Event): void {
    event.stopPropagation();
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
    this.filesService.loadFile(filePath);
    this.filesService.setLoadedFile(true);
    setTimeout((): void => {
      this.router.navigate(['/main-screen']);
    }, 300);
  }

  public printFile(filePath: string): void {
    this.filesService.printFile(filePath);
    setTimeout((): void => {
      this.router.navigate(['/main-screen']);
    }, 550);
  }

  public deleteFile(filePath: string): void {
    this.filesService.deleteFile(filePath);
    setTimeout((): void => {
      this.closeDetails();
      this.openFolder(this.currentFolder);
    }, 300);
  }

  private hideLoader(): void {
    if (Date.now() - this.loading > 750) {
      this.loading = 0;
    } else {
      setTimeout(this.hideLoader.bind(this), 750 - (Date.now() - this.loading));
    }
  }

  private showLoader(): void {
    this.loading = Date.now();
  }

  public goToMainScreen(): void {
    this.router.navigate(['/main-screen']);
  }
}
