import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { FilamentSpool } from '../../model';
import { SpoolmanCurrentJobRequirements, SpoolmanSpool, SpoolmanSpoolList } from '../../model/octoprint';
import { ConfigService } from '../config.service';
import { FilamentPluginService } from './filament-plugin.service';

const colorRegexp = /\((.*)\)$/g;

@Injectable()
export class SpoolmanOctoprintService implements FilamentPluginService {
  public constructor(
    private configService: ConfigService,
    private http: HttpClient,
  ) {}

  public getSpools(): Observable<Array<FilamentSpool>> {
    return this.http
      .get(this.configService.getApiURL('plugin/Spoolman/spoolman/spools', false), this.configService.getHTTPHeaders())
      .pipe(
        map((spools: SpoolmanSpoolList): Array<FilamentSpool> => {
          return spools.data.spools.map((spool: SpoolmanSpool): FilamentSpool => {
            return this.convertSpoolmanSpool(spool);
          });
        }),
      );
  }

  public getCurrentSpool(): Observable<FilamentSpool> {
    const availableSpools = this.getSpools();
    const currentJobRequirements = this.http.get<SpoolmanCurrentJobRequirements>(
      this.configService.getApiURL('plugin/Spoolman/self/current-job-requirements', false),
      this.configService.getHTTPHeaders(),
    );
    return forkJoin([availableSpools, currentJobRequirements]).pipe<FilamentSpool>(
      map(results => {
        const spools = results[0];
        const requirements = results[1];
        if (!requirements.data.isFilamentUsageAvailable) {
          return;
        }
        const selected = spools.find(spool => spool.id === requirements.data.tools[0].spoolId);
        return selected;
      }),
    );
  }

  public getCurrentSpools(): Observable<Array<FilamentSpool>> {
    return of([]);
  }

  private convertSpoolmanSpool(spool: SpoolmanSpool): FilamentSpool {
    colorRegexp.lastIndex = 0;
    return {
      color: spool.filament.color_hex,
      density: spool.filament.density,
      diameter: spool.filament.diameter,
      displayName: `${spool.filament.vendor?.name || ''} - ${spool.filament.name || ''}`,
      id: spool.id,
      material: spool.filament.material || '',
      name: spool.filament.name,
      temperatureOffset: 0,
      used: spool.used_weight,
      vendor: spool.filament.vendor?.name || 'Unknown',
      weight: spool.initial_weight || spool.filament.weight || 1000,
    };
  }

  public setSpool(spool: FilamentSpool): Observable<void> {
    const setSpoolBody = {
      selection: {
        toolIdx: 0,
        spoolId: spool.id,
      },
    };

    return this.http.post<void>(
      this.configService.getApiURL('plugin/Spoolman/self/spool', false),
      setSpoolBody,
      this.configService.getHTTPHeaders(),
    );
  }
}
