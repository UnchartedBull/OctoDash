import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { BasePathService } from './base-path.service';
import { ConfigService } from './config.service';

@Injectable()
export class ChangeInstanceService {
  private http = inject(HttpClient);
  private basePathService = inject(BasePathService);
  private config = inject(ConfigService);

  public changeInstance(instance) {
    return this.http.post(
      `${this.basePathService.getBasePath()}/plugin/octodash/api/change_instance`,
      { instance },
      this.config.getHTTPHeaders(),
    );
  }
}
