import { Injectable } from '@angular/core';
import { ConfigService } from './config/config.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private updateError: string[];

  constructor(private configService: ConfigService) {
    this.updateError = [
      '.printer should have required property \'xySpeed\'',
      '.printer should have required property \'zSpeed\'',
      '.octodash should have required property \'customActions\''];
  }

  public getUpdateError(): string[] {
    return this.updateError;
  }

  // If the errors can be automatically fixed return true here
  public autoFixError(): boolean {
    const config = this.configService.config;
    config.octodash.customActions = [
      {
        icon: 'home',
        command: 'G28',
        color: '#dcdde1'
      },
      {
        icon: 'ruler-vertical',
        command: 'G29',
        color: '#44bd32'
      },
      {
        icon: 'fire-alt',
        command: 'M140 S50; M104 S185',
        color: '#e1b12c'
      },
      {
        icon: 'snowflake',
        command: 'M140 S0; M104 S0',
        color: '#0097e6'
      },
      {
        icon: 'redo-alt',
        command: '[!RELOAD]',
        color: '#7f8fa6'
      },
      {
        icon: 'skull',
        command: '[!KILL]',
        color: '#e84118'
      }
    ];
    config.printer.xySpeed = 150;
    config.printer.zSpeed = 5;
    this.configService.saveConfig(config);
    this.configService.updateConfig();
    return true;
  }

}
