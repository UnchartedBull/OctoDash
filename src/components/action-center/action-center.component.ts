import { Component, Input, OnInit, OnDestroy } from '@angular/core';
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

  public active = false;

  constructor() {}

  ngOnInit() {
    this.eventsSubscription = this.closeEvent.subscribe(() => (this.active = false));
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }
}
