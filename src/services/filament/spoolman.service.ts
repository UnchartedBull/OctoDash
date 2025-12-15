import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FilamentSpool } from '../../model';
import {
  OctoPrintSettings,
  SpoolmanCurrentJobRequirements,
  SpoolmanSpool,
  SpoolmanSpoolList,
} from '../../model/octoprint';
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

  public getCurrentSpool(tool: number): Observable<FilamentSpool> {
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
        const selected = spools.find(spool => spool.id === requirements.data.tools[tool].spoolId);
        return selected;
      }),
    );
  }

  public getCurrentSpools(): Observable<Array<FilamentSpool>> {
    const availableSpools = this.getSpools();
    const selectedSpools = this.http
      .get<OctoPrintSettings>(this.configService.getApiURL('settings', true), this.configService.getHTTPHeaders())
      .pipe(map(settings => settings.plugins.Spoolman?.selectedSpoolIds));

    return forkJoin([availableSpools, selectedSpools]).pipe<FilamentSpool[]>(
      map(results => {
        const spools = results[0];
        const selectedIds = results[1];
        if (!selectedIds) {
          return [];
        }

        const selected: FilamentSpool[] = Object.entries(selectedIds).map(tool => {
          const spoolId = +tool[1].spoolId;
          const spool = spools.find(spool => spool.id === spoolId);
          return spool;
        });

        return selected;
      }),
    );
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

  public setSpool(spool: FilamentSpool, tool: number): Observable<void> {
    const setSpoolBody = {
      toolIdx: tool,
      spoolId: spool.id,
    };

    return this.http.post<void>(
      this.configService.getApiURL('plugin/Spoolman/self/spool', false),
      setSpoolBody,
      this.configService.getHTTPHeaders(),
    );
  }
}
