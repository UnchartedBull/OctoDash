import { Component, EventEmitter, Output } from '@angular/core';

import { AppService } from '../../services/app.service';
import { SystemService } from '../../services/system/system.service';

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
  ) {}

  public closeResetWindow(): void {
    this.closeFunction.emit();
  }

  public reset(): void {}
}
