import { Component, OnInit } from '@angular/core';

import { ConfigService } from '../config.service';

@Component({
  selector: 'app-invalid-config',
  templateUrl: './invalid-config.component.html',
  styleUrls: ['./invalid-config.component.scss'],
})
export class InvalidConfigComponent implements OnInit {
  public errors: string[];

  public constructor(private configService: ConfigService) {}

  public ngOnInit(): void {
    this.errors = this.configService.getErrors();
  }
}
