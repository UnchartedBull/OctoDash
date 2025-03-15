import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[long-press]',
})
export class LongPress {
  pressing: boolean;
  longPressing: boolean;
  timeout: ReturnType<typeof setTimeout>;
  interval: ReturnType<typeof setInterval>;

  @Input() duration = 700;
  @Input() frequency = 100;

  @Output()
  onShortPress = new EventEmitter();

  @Output()
  onLongPress = new EventEmitter();

  @Output()
  onLongPressing = new EventEmitter();

  @HostListener('pointerdown', ['$event'])
  onMouseDown(event: EventSource): void {
    this.pressing = true;
    this.longPressing = false;

    this.timeout = setTimeout(() => {
      this.longPressing = true;
      this.onLongPress.emit(event);

      this.interval = setInterval(() => {
        this.onLongPressing.emit(event);
      }, this.frequency);
    }, this.duration);
  }

  @HostListener('pointerup', ['$event'])
  endPress(event: EventSource): void {
    clearTimeout(this.timeout);
    clearInterval(this.interval);

    if (!this.longPressing && this.pressing) {
      this.onShortPress.emit(event);
    }
    this.longPressing = false;
    this.pressing = false;
  }

  @HostListener('pointerleave', ['$event'])
  endPressMove(): void {
    clearTimeout(this.timeout);
    clearInterval(this.interval);

    this.longPressing = false;
    this.pressing = false;
  }
}
