import { Injectable } from '@angular/core';

export const getBase = () => {
  return window['__baseHref'] || '';
};

@Injectable()
export class BasePathService {
  public getBasePath(): string {
    return getBase();
  }
}
