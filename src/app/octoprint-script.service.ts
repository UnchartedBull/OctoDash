import { Injectable } from '@angular/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const OctoPrint: any;

@Injectable()
export class OctoprintScriptService {
  public loaded = false;
  private checkInterval = 1000;
  private numberDownloadFailed = 0;

  async initialize(octoprintURL: string, apiKey: string): Promise<void> {
    return new Promise(resolve => {
      this.tryDownload(octoprintURL, apiKey, resolve);
    });
  }

  tryDownload(octoprintURL: string, apiKey: string, resolve: () => void): void {
    this.downloadScript(octoprintURL)
      .then(() => {
        this.authenticate(apiKey);
        console.clear();
        resolve();
      })
      .catch(() => {
        if (this.numberDownloadFailed < 30) {
          this.numberDownloadFailed++;
        } else if (this.numberDownloadFailed === 30) {
          this.checkInterval = 15000;
        }
        setTimeout(this.tryDownload.bind(this), this.checkInterval, octoprintURL, apiKey, resolve);
      });
  }

  downloadScript(octoprintURL: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const octoprintStaticURL = octoprintURL.replace('/api/', '/static/');
      this.loadScript(`${octoprintStaticURL}webassets/packed_client.js`)
        .then(() => {
          OctoPrint.options.baseurl = octoprintURL;
          resolve();
        })
        .catch(() => reject());
    });
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
