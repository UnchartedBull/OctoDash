import { Injectable } from '@angular/core';
import { TempOption } from 'src/model/temp-options.model';

@Injectable()
export class ProfileService {
  public getHotendProfiles(): TempOption[] {
    return [
      { value: 0, label: 'Off' },
      { value: 180, label: 'PLA' },
      { value: 200, label: 'Default' },
      { value: 360, label: 'ABS' },
    ];
  }

  public getBedProfiles(): TempOption[] {
    return [
      { value: 0, label: 'Off' },
      { value: 60, label: 'PLA' },
      { value: 65, label: 'Default' },
      { value: 80, label: 'ABS' },
    ];
  }

  public getFanProfiles(): TempOption[] {
    return [
      { value: 0, label: 'Off' },
      { value: 100, label: 'On' },
    ];
  }
}
