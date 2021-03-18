import { Injectable } from '@angular/core';

import { ConfigService } from './config/config.service';

@Injectable()
export class ConversionService {
  constructor(private configService: ConfigService) {}

  public convertByteToMegabyte(byte: number): string {
    return (byte / 1000000).toFixed(1);
  }

  public convertDateToString(date: Date): string {
    return `${('0' + date.getDate()).slice(-2)}.${('0' + (date.getMonth() + 1)).slice(-2)}.${date.getFullYear()} ${(
      '0' + date.getHours()
    ).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`;
  }

  public convertSecondsToHours(input: number): string {
    const hours = input / 60 / 60;
    let roundedHours = Math.floor(hours);
    const minutes = (hours - roundedHours) * 60;
    let roundedMinutes = Math.round(minutes);
    if (roundedMinutes === 60) {
      roundedMinutes = 0;
      roundedHours += 1;
    }
    return roundedHours + ':' + ('0' + roundedMinutes).slice(-2);
  }

  public convertFilamentLengthToWeight(filamentLength: number): number {
    return this.convertFilamentVolumeToWeight(
      (filamentLength * Math.PI * Math.pow(this.configService.getFilamentThickness() / 2, 2)) / 1000,
    );
  }

  private convertFilamentVolumeToWeight(filamentVolume: number): number {
    return Math.round(filamentVolume * this.configService.getFilamentDensity() * 10) / 10;
  }
}
