import { Component, OnInit } from '@angular/core';

import { ConfigService } from '../config.service';

@Component({
  selector: 'app-config-invalid',
  templateUrl: './invalid.component.html',
  styleUrls: ['./invalid.component.scss'],
})
export class ConfigInvalidComponent implements OnInit {
  public errors: string[];

  public constructor(private configService: ConfigService) {}

  public ngOnInit(): void {
    this.errors = this.configService.getErrors();
  }
}
