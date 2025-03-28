import { Component, OnInit } from '@angular/core';

import { ConfigService } from '../../../services/config.service';
import { ElectronService } from '../../../services/electron.service';

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
