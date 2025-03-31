import { Pipe, PipeTransform } from '@angular/core';

import { Filament } from '../../../model/octoprint/octoprint-settings.model';

@Pipe({ name: 'enabledFilamentOnly', standalone: false })
export class EnabledFilamentOnlyPipe implements PipeTransform {
  public transform(filaments: Filament[]): Filament[] {
    return filaments.filter(filament => filament.enabled);
  }
}
