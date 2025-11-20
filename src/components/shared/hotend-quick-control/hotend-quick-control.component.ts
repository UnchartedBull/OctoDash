import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { ProfileService } from 'src/services/profile/profile.service';

@Component({
  selector: 'app-hotend-quick-control',
  templateUrl: './hotend-quick-control.component.html',
  standalone: false,
  // styleUrls: ['./hotend-quick-control.component.scss'],
})
export class HotendQuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);
  @Output() onBack = new EventEmitter<void>();
  @Output() onSet = new EventEmitter<number>();

  options = this.profileService.getHotendProfiles();

  public back(): void {
    this.onBack.emit();
  }

  public setValue(value: number): void {
    this.onSet.emit(value);
  }
}
