import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-action-center',
  templateUrl: './action-center.component.html',
  styleUrls: ['./action-center.component.scss'],
  standalone: false,
})
export class ActionCenterComponent implements OnInit, OnDestroy {
  @Input() closeEvent: Observable<void>;
  private eventsSubscription: Subscription;

  public visible = false;

  constructor() {}

  ngOnInit() {
    this.eventsSubscription = this.closeEvent.subscribe(() => (this.visible = false));
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }
}
