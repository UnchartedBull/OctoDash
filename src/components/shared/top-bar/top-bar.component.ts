import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

type Button = {
  text?: string;
  icon?: string;
};

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss'],
  standalone: false,
})
export class TopBarComponent implements OnInit {
  @Input() backButton: Button | boolean;
  @Input() nextButton: Button | boolean;

  @Output() onBack = new EventEmitter<boolean>();
  @Output() onNext = new EventEmitter<boolean>();

  public back: Button;
  public next: Button;

  public constructor(private router: Router) {}

  ngOnInit(): void {
    if (this.backButton) {
      if (this.backButton === true) {
        this.backButton = {};
      }
      this.back = {
        text: this.backButton?.text || $localize`:@@ui-back:back`,
        icon: this.backButton?.icon || 'chevron-left',
      };
    }
    if (this.nextButton) {
      if (this.nextButton === true) {
        this.nextButton = {};
      }
      this.next = {
        text: this.nextButton?.text || $localize`:@@ui-next:next`,
        icon: this.nextButton?.icon || 'chevron-right',
      };
    }
  }
}
