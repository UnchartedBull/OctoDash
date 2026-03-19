import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PluginResponse } from 'src/model/octoprint';

import { BasePathService } from './base-path.service';
import { ConfigService } from './config.service';

@Injectable()
export class PluginsService {
  private http = inject(HttpClient);
  private basePathService = inject(BasePathService);
  private config = inject(ConfigService);
  public getEnabledPlugins(): Observable<string[]> {
    return this.http
      .get<PluginResponse>(
        `${this.basePathService.getBasePath()}/plugin/pluginmanager/plugins`,
        this.config.getHTTPHeaders(),
      )
      .pipe(map(response => response.plugins.filter(plugin => plugin.enabled).map(plugin => plugin.key)));
  }
}
