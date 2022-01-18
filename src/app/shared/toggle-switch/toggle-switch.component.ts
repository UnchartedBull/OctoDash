import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-toggle-switch',
  templateUrl: './toggle-switch.component.html',
  styleUrls: ['./toggle-switch.component.scss'],
})
export class ToggleSwitchComponent {
  @Input() value: boolean;
  @Output() valueChange = new EventEmitter<boolean>();

  public toggleSwitchOptions: AnimationOptions = {
    path: 'assets/animations/toggle-switch.json',
    loop: false,
  };

  private animation: AnimationItem;

  public animationCreated(animation: AnimationItem): void {
    this.animation = animation;
    this.animation.autoplay = false;
    this.animation.setSpeed(2);
    if (this.value) {
      this.animation.goToAndStop(46, true);
    } else {
      this.animation.goToAndStop(0, true);
    }
  }

  public toggleValue(): void {
    this.value = !this.value;
    this.valueChange.emit(this.value);
    if (this.value) {
      this.animation.playSegments([1, 46], true);
    } else {
      this.animation.playSegments([46, 91], true);
    }
  }
}
