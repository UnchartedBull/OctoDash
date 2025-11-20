import { Component, inject } from '@angular/core';
import { ConfigService } from 'src/services/config.service';
import { ProfileService } from 'src/services/profile/profile.service';

import { QuickControlComponent } from '../quick-control/quick-control.component';

@Component({
  selector: 'app-hotend-quick-control',
  templateUrl: './hotend-quick-control.component.html',
  standalone: false,
})
export class HotendQuickControlComponent extends QuickControlComponent {
  public configService = inject(ConfigService);
  public profileService = inject(ProfileService);

  options$ = this.profileService.getHotendProfiles();
}
