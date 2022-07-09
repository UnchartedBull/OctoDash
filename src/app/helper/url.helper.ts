import { URLSplit } from '../config/config.model';

export class UrlHelper {
  static splitUrl(octoprintURL: string): URLSplit {
    const host = octoprintURL.split(':')[1].replace('//', '');
    const port = parseInt(octoprintURL.split(':')[2], 10);

    return {
      host,
      port: isNaN(port) ? null : port,
    };
  }
}
