import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
  standalone: false,
})
export class ResetComponent {
  @Output() closeFunction = new EventEmitter<void>(true);

  constructor() {}

  public closeResetWindow(): void {
    this.closeFunction.emit();
  }

  public reset(): void {
    //TODO: Actually reset here
  }
}
