import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PluginResponse } from 'src/model/octoprint';

import { BasePathService } from './base-path.service';

@Injectable()
export class PluginsService {
  private http = inject(HttpClient);
  private basePathService = inject(BasePathService);
  public getEnabledPlugins(): Observable<string[]> {
    return this.http
      .get<PluginResponse>(this.basePathService.getApiURL('plugin/pluginmanager/plugins', false))
      .pipe(map(response => response.plugins.filter(plugin => plugin.enabled).map(plugin => plugin.key)));
  }
}
