import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const OctoPrint: any;

@Injectable()
export class OctoprintScriptService {
  public loaded = false;
  private octoprintURL: string;

  async initialize(octoprintURL: string): Promise<void> {
    this.octoprintURL = octoprintURL.replace('api/', '');
    const octoprintStaticURL = octoprintURL.replace('/api/', '/static/');
    const scripts: string[] = [`${octoprintStaticURL}webassets/packed_client.js`];
    await this.load(scripts);
    OctoPrint.options.baseurl = this.octoprintURL;
  }

  private load(scripts: string[]): Promise<void[]> {
    const promises: Promise<void>[] = [];
    scripts.forEach(script => promises.push(this.loadScript(script)));
    return Promise.all(promises);
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  }

  public authenticate(accessToken: string): void {
    OctoPrint.options.apikey = accessToken;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public getInstance(): any {
    return OctoPrint;
  }
}
