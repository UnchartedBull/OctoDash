import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppService } from 'src/services/app.service';

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.scss'],
  standalone: false,
})
export class VersionComponent {
  appService = inject(AppService);

  currentVersion = signal('loading...');

  constructor() {
    this.appService
      .getVersionInfo()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data: { current_version: string }) => {
          this.currentVersion.set(data.current_version);
        },
        error: () => {
          this.currentVersion.set('Error fetching version');
        },
      });
  }
}
