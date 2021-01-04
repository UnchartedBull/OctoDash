import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConfigService } from '../../config/config.service';
import { FilamentManagementPlugin, FilamentSpool } from './filament.interface';

const colorRegexp = /\((.*)\)$/g;

@Injectable({
  providedIn: 'root',
})
export class FilamentManagerService implements FilamentManagementPlugin {
  public constructor(private configService: ConfigService, private http: HttpClient) {}

  public getSpools(): Observable<Array<FilamentSpool>> {
    return this.http
      .get(
        this.configService.getURL('plugin/filamentmanager/spools').replace('/api', ''),
        this.configService.getHTTPHeaders(),
      )
      .pipe(
        map(
          (spools: FilamentManagerSpoolList): Array<FilamentSpool> => {
            return spools.spools.map(
              (spool: FilamentManagerSpool): FilamentSpool => {
                return this.convertFilamentManagerSpool(spool);
              },
            );
          },
        ),
      );
  }

  public getCurrentSpool(): Observable<FilamentSpool> {
    return this.http
      .get(
        this.configService.getURL('plugin/filamentmanager/selections').replace('/api', ''),
        this.configService.getHTTPHeaders(),
      )
      .pipe(
        map(
          (selection: FilamentManagerSelections): FilamentSpool => {
            if (selection.selections.length > 0) {
              return this.convertFilamentManagerSpool(selection.selections[0].spool);
            } else {
              return null;
            }
          },
        ),
      );
  }

  private convertFilamentManagerSpool(spool: FilamentManagerSpool): FilamentSpool {
    colorRegexp.lastIndex = 0;
    const match = colorRegexp.exec(spool.name);
    return {
      color: match ? match[1] : '#f5f6fa',
      density: spool.profile.density,
      diameter: spool.profile.diameter,
      displayName: match
        ? `${spool.profile.vendor} - ${spool.name.replace(match[0], '')}`
        : `${spool.profile.vendor} - ${spool.name}`,
      id: spool.id,
      material: spool.profile.material,
      name: spool.name,
      temperatureOffset: spool.temp_offset,
      used: spool.used,
      vendor: spool.profile.vendor,
      weight: spool.weight,
    };
  }

  public setSpool(spool: FilamentSpool): Observable<void> {
    const setSpoolBody: FilamentManagerSelectionPatch = {
      selection: {
        tool: 0,
        spool: {
          id: spool.id,
        },
      },
    };

    return this.http.patch<void>(
      this.configService.getURL('plugin/filamentmanager/selections/0').replace('/api', ''),
      setSpoolBody,
      this.configService.getHTTPHeaders(),
    );
  }
}

export interface FilamentManagerSpoolList {
  spools: FilamentManagerSpool[];
}

interface FilamentManagerSelections {
  selections: FilamentManagerSelection[];
}

interface FilamentManagerSelectionPatch {
  selection: {
    tool: number;
    spool: {
      id: number;
    };
  };
}

interface FilamentManagerSelection {
  // eslint-disable-next-line camelcase
  client_id: string;
  spool: FilamentManagerSpool;
  tool: number;
}

interface FilamentManagerSpool {
  /* eslint-disable camelcase */
  cost: number;
  id: number;
  name: string;
  displayName?: string;
  color?: string;
  profile: FilamentManagerProfile;
  temp_offset: number;
  used: number;
  weight: number;
}

interface FilamentManagerProfile {
  density: number;
  diameter: number;
  id: number;
  material: string;
  vendor: string;
}
