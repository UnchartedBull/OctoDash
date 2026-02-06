import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PluginResponse } from 'src/model/octoprint';

@Injectable()
export class PluginsService {
  private http = inject(HttpClient);
  public getEnabledPlugins(): Observable<string[]> {
    return this.http
      .get<PluginResponse>('/plugin/pluginmanager/plugins')
      .pipe(map(response => response.plugins.filter(plugin => plugin.enabled).map(plugin => plugin.key)));
  }
}
