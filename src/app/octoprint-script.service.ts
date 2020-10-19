import { Injectable } from '@angular/core';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const OctoPrint: any;

@Injectable()
export class OctoprintScriptService {
  public loaded = false;
  private octoprintURL: string;

  async initialize(octoprintURL: string): Promise<void> {
    // script loading might fail try 3 times in total, probably can be cleaned up in the future
    return new Promise((resolve, reject) => {
      this.octoprintURL = octoprintURL.replace('api/', '');
      const octoprintStaticURL = octoprintURL.replace('/api/', '/static/');
      this.loadScript(`${octoprintStaticURL}webassets/packed_client.js`)
        .then(() => {
          OctoPrint.options.baseurl = this.octoprintURL;
          resolve();
        })
        .catch(() => {
          setTimeout(() => {
            this.loadScript(`${octoprintStaticURL}webassets/packed_client.js`)
              .then(() => {
                OctoPrint.options.baseurl = this.octoprintURL;
                resolve();
              })
              .catch(() => {
                setTimeout(() => {
                  this.loadScript(`${octoprintStaticURL}webassets/packed_client.js`)
                    .then(() => {
                      OctoPrint.options.baseurl = this.octoprintURL;
                      resolve();
                    })
                    .catch(() => reject());
                }, 10000);
              });
          }, 5000);
        });
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
