import { Component, inject } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { ProfileService } from 'src/services/profile/profile.service';

import { QuickControlComponent } from '../quick-control/quick-control.component';

@Component({
  selector: 'app-fan-quick-control',
  templateUrl: './fan-quick-control.component.html',
  standalone: false,
})
export class FanQuickControlComponent extends QuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);

  options$ = this.profileService.getFanProfiles();
}
