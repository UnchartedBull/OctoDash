import { Component, EventEmitter, Output } from '@angular/core';

import { AppService } from '../app.service';
import { ElectronService } from '../electron.service';
import { SystemService } from '../services/system/system.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
  standalone: false,
})
export class ResetComponent {
  @Output() closeFunction = new EventEmitter<void>(true);

  constructor(
    public service: AppService,
    private systemService: SystemService,
    private electronService: ElectronService,
  ) {}

  public closeResetWindow(): void {
    this.closeFunction.emit();
  }

  public reset(): void {
    this.electronService.send('resetConfig');
    this.electronService.send('reload');
  }
}
