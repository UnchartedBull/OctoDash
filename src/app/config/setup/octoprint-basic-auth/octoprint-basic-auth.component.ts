import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BasicAuth } from '../../config.model';

@Component({
  selector: 'app-config-setup-octoprint-basic-auth',
  templateUrl: './octoprint-basic-auth.component.html',
  styleUrls: ['./octoprint-basic-auth.component.scss', '../setup.component.scss'],
})
export class OctoprintBasicAuthComponent {
  @Input() basicAuth: BasicAuth = {};

  @Output() basicAuthChange = new EventEmitter<BasicAuth>();

  get user(): string {
    return this.basicAuth && this.basicAuth.user;
  }

  set user(user: string) {
    if (!this.basicAuth) {
      this.basicAuth = {};
    }
    this.basicAuth.user = user;
  }

  get pass(): string {
    return this.basicAuth && this.basicAuth.pass;
  }

  set pass(pass: string) {
    if (!this.basicAuth) {
      this.basicAuth = {};
    }
    this.basicAuth.pass = pass;
  }

  change() {
    this.basicAuthChange.emit((this.basicAuth && this.basicAuth.user && this.basicAuth.pass) ? this.basicAuth : null);
  }
}
