import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ConfigService } from '../config.service';
import _ from 'lodash';

// Insert the update message here of the last update, that breaks with the config from a version before.
// If this gets updated no-config also needs to be updated with an automated fix to generate an at least valid config
const updateError = ['. should have required property \'octodash\''];

@Component({
  selector: 'app-invalid-config',
  templateUrl: './invalid-config.component.html',
  styleUrls: ['./invalid-config.component.scss']
})


export class InvalidConfigComponent implements OnInit {
  errors: string[];

  constructor(private configService: ConfigService) {

  }

  ngOnInit() {
    this.errors = this.configService.getErrors();
    if (_.isEqual(this.errors, updateError)) {
      // this is needed to fix the ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.configService.config = null;
        this.configService.update = true;
      });
    }
  }
}
