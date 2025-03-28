import { Component, OnInit } from '@angular/core';

import { ElectronService } from '../../../services/electron.service';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-config-invalid',
  templateUrl: './invalid-config.component.html',
  styleUrls: ['./invalid-config.component.scss'],
  standalone: false,
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
