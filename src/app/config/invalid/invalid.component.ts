import { Component, OnInit } from '@angular/core';

import { ElectronService } from '../../electron.service';
import { ConfigService } from '../config.service';

@Component({
  selector: 'app-config-invalid',
  templateUrl: './invalid.component.html',
  styleUrls: ['./invalid.component.scss'],
})
export class ConfigInvalidComponent implements OnInit {
  public errors: string[];

  public constructor(
    private configService: ConfigService,
    private electronService: ElectronService,
  ) {
    this.electronService.send('resetConfig');
  }

  public ngOnInit(): void {
    this.errors = this.configService.getErrors();
  }
}
