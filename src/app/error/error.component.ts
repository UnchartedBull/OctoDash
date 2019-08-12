import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorService, Error } from './error.service';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnDestroy {

  private subscriptions: Subscription = new Subscription();

  public error: Error = {
    heading: '',
    text: ''
  };
  public show = false;

  constructor(private errorService: ErrorService) {
    this.subscriptions.add(this.errorService.getObservable().subscribe((error: Error) => this.setError(error)));
  }

  hideError() {
    this.show = false;
  }

  setError(error: Error) {
    this.error = error;
    this.show = true;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

}
