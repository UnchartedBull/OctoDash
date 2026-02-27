import { Injectable } from '@angular/core';

export const getBase = () => {
  return window.location.pathname.split('/plugin/octodash')[0] || '';
};

@Injectable()
export class BasePathService {
  public getBasePath(): string {
    return getBase();
  }
}
