import { Component, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";

import { Notification, NotificationService } from "./notification.service";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"],
})
export class NotificationComponent implements OnDestroy {
  private subscriptions: Subscription = new Subscription();

  public notification: Notification = {
    heading: "",
    text: "",
    type: "",
  };
  public show = false;

  public constructor(private notificationService: NotificationService) {
    this.subscriptions.add(
      this.notificationService.getObservable().subscribe((message: Notification): void => this.setNotification(message))
    );
  }

  public hideNotification(): void {
    this.show = false;
  }

  public setNotification(notification: Notification): void {
    this.notification = notification;
    this.show = true;
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
