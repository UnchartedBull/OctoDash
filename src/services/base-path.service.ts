import { Injectable } from '@angular/core';

@Injectable()
export class BasePathService {
  public getBasePath(): string {
    return window['__baseHref'] || '';
  }
}
