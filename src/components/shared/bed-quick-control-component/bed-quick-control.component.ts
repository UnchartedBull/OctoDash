import { Component, EventEmitter, inject, Output } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { ProfileService } from 'src/services/profile/profile.service';

import { QuickControlComponent } from '../quick-control/quick-control.component';

@Component({
  selector: 'app-bed-quick-control',
  templateUrl: './bed-quick-control.component.html',
  standalone: false,
})
export class BedQuickControlComponent extends QuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);

  options$ = this.profileService.getBedProfiles();
}
