import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface PluginInfo {
  enabled: boolean;
  key: string;
}

interface PluginResponse {
  plugins: PluginInfo[];
}

@Injectable()
export class PluginsService {
  private http = inject(HttpClient);
  public getEnabledPlugins(): Observable<string[]> {
    return this.http
      .get<PluginResponse>('/plugin/pluginmanager/plugins')
      .pipe(map(response => response.plugins.filter(plugin => plugin.enabled).map(plugin => plugin.key)));
  }
}
