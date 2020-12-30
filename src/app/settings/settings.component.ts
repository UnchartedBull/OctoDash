import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChildProcessService } from 'ngx-childprocess';
import { ElectronService } from 'ngx-electron';

import { AppService } from '../app.service';
import { Config } from '../config/config.model';
import { ConfigService } from '../config/config.service';
import { NotificationService } from '../notification/notification.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  @Output() closeFunction = new EventEmitter<void>();
  @ViewChild('settingsMain') private settingsMain: ElementRef;
  @ViewChild('settingsGeneral') private settingsGeneral: ElementRef;
  @ViewChild('settingsOctoDash') private settingsOctoDash: ElementRef;
  @ViewChild('settingsPlugins') private settingsPlugins: ElementRef;
  @ViewChild('settingsCredits') private settingsCredits: ElementRef;
  @ViewChild('settingsWifi') private settingsWifi: ElementRef;
  @ViewChild('settingsWifiConnect') private settingsWifiConnect: ElementRef;

  public fadeOutAnimation = false;
  public config: Config;
  public wifiList = [];
  public defineWifi = [{
    ssid: '',
    configured: true,
    connected: true,
    quality: 0,
    encryption: true
  }];
  public customActionsPosition = [
    'Top Left',
    'Top Right',
    'Middle Left',
    'Middle Right',
    'Bottom Left',
    'Bottom Right',
  ];
  private overwriteNoSave = false;
  private pages = {};
  public update = false;

  public constructor(
    private configService: ConfigService,
    private notificationService: NotificationService,
    private electronService: ElectronService,
    private childProcessService: ChildProcessService,
    public service: AppService,
  ) {
    this.config = this.configService.getCurrentConfig();
    this.config.octoprint.urlSplit = this.configService.splitOctoprintURL(this.config.octoprint.url);
  }

  public ngOnInit(): void {
    setTimeout((): void => {
      this.pages = [
        this.settingsMain.nativeElement,
        this.settingsGeneral.nativeElement,
        this.settingsOctoDash.nativeElement,
        this.settingsPlugins.nativeElement,
        this.settingsCredits.nativeElement,
        this.settingsWifi.nativeElement,
        this.settingsWifiConnect.nativeElement,
      ];
      this.wifiList = this.scanWirelessNetworks();
    }, 400);
  }

  public hideSettings(): void {
    if (
      this.configService.isEqualToCurrentConfig(this.configService.createConfigFromInput(this.config)) ||
      this.overwriteNoSave
    ) {
      this.fadeOutAnimation = true;
      this.closeFunction.emit();
      setTimeout((): void => {
        this.fadeOutAnimation = false;
      }, 5000);
    } else {
      this.notificationService.setWarning(
        'Configuration not saved!',
        "You haven't saved your config yet, so your changes will not be applied. Click close again if you want to discard your changes!",
      );
      this.overwriteNoSave = true;
    }
  }

  public changePage(page: number, current: number, direction: 'forward' | 'backward'): void {
    this.pages[current].classList.add('settings__content-slideout-' + direction);
    this.pages[page].classList.remove('settings__content-inactive');
    this.pages[page].classList.add('settings__content-slidein-' + direction);

    setTimeout((): void => {
      this.pages[current].classList.add('settings__content-inactive');
      this.pages[current].classList.remove('settings__content-slideout-' + direction);
      this.pages[page].classList.remove('settings__content-slidein-' + direction);
    }, 370);
  }

  public updateConfig(): void {
    const config = this.configService.createConfigFromInput(this.config);
    if (!this.configService.validateGiven(config)) {
      this.notificationService.setError('Config is invalid!', this.configService.getErrors().toString());
    }
    this.configService.saveConfig(config);
    this.overwriteNoSave = true;
    this.hideSettings();
    this.electronService.ipcRenderer.send('reload');
  }

  public showUpdate(): void {
    this.update = true;
  }

  public hideUpdate(): void {
    this.update = false;
  }

  public getWirelessStatus(): unknown {
    let enabled = false;
    const mode = 'sta';
    const options = {ssid:'',key:'', networks:[],encryption:''};

    const proc = this.childProcessService.childProcess.spawnSync(
      'wpa_cli',
      ['-i', 'wlan0', 'status'],
      {encoding: 'utf8'}
    );

    if (proc.status !== 0) {
      return { enabled, mode, options };
    }

    for (const line of proc.stdout.split('\n')) {
      const [key, value] = line.split('=', 2);
      switch (key) {
        case 'wpa_state':
          enabled = line.split('=')[1] === 'COMPLETED';
          break;
        case 'ssid':
          options.ssid = line.substring(5);
          break;
      }
    }
    return { enabled, mode, options };
  }

  public scanWirelessNetworks() {
    let status: any = {};
    status = this.getWirelessStatus();
  
    const proc = this.childProcessService.childProcess.spawnSync(
      'sudo',
      ['iwlist', 'scanning'],
      {encoding: 'utf8'}
    );
  
    const lines = proc.stdout
      .split('\n')
      .filter((l) => l.startsWith(' '))
      .map((l) => l.trim());
  
    // Add an empty line so we don't miss the last cell.
    lines.push('');
  
    const cells = new Map();
    let cell: any = {};
  
    for (const line of lines) {
      // New cell, start over
      if (line.startsWith('Cell ') || line.length === 0) {
        if ('ssid' in cell &&
            'quality' in cell &&
            'encryption' in cell &&
            cell.ssid.length > 0) {
          if (status.mode === 'sta' && status.options.networks &&
              status.options.networks.includes(cell.ssid)) {
            cell.configured = true;
            cell.connected = status.enabled;
          } else {
            cell.configured = false;
            cell.connected = false;
          }
  
          // If there are two networks with the same SSID, but one is encrypted
          // and the other is not, we need to keep both.
          const key = `${cell.ssid}-${cell.encryption}`;
          if (cells.has(key)) {
            const stored = cells.get(key);
            stored.quality = Math.max(stored.quality, cell.quality);
          } else {
            cells.set(key, cell);
          }
        }
  
        cell = {};
      }
  
      if (line.startsWith('ESSID:')) {
        cell.ssid = line.substring(7, line.length - 1);
      }
  
      if (line.startsWith('Quality=')) {
        cell.quality = Number(line.split(' ')[0].split('=')[1].split('/')[0]);
      }
  
      if (line.startsWith('Encryption key:')) {
        cell.encryption = line.split(':')[1] === 'on';
      }
    }
  
    return Array.from(cells.values()).sort((a, b) => b.quality - a.quality);
  }

  public setWirelessMode(enabled, mode = 'ap', options: any = {}) {
    const valid = ['ap', 'sta'];
    if (enabled && !valid.includes(mode)) {
      return false;
    }
  
    // First, remove existing networks
    console.log('1');
    let proc = this.childProcessService.childProcess.spawnSync(
      'sudo wpa_cli',
      ['-i', 'wlan0', 'list_networks'],
      {encoding: 'utf8',
      shell: true}
    );
    console.log(proc);
    if (proc.status === 0) {
      console.log('removing');
      const networks = proc.stdout.split('\n')
        .filter((l) => !l.startsWith('network'))
        .map((l) => l.split(' ')[0])
        .reverse();
  
      for (const id of networks) {
        console.log('2');
        proc = this.childProcessService.childProcess.spawnSync(
          'sudo wpa_cli',
          ['-i', 'wlan0', 'remove_network', id],
          {shell: true}
        );
        if (proc.status !== 0) {
          console.log('Failed to remove network with id:', id);
        }
      }
    }
    console.log('5');
    // Make sure Wi-Fi isn't blocked by rfkill
    this.childProcessService.childProcess.spawnSync(
      'sudo',
      ['rfkill', 'unblock', 'wifi'],
      {}
    );
    console.log('6');
    if (mode === 'sta') {
      proc = this.childProcessService.childProcess.spawnSync(
        'sudo wpa_cli',
        ['-i', 'wlan0', 'add_network'],
        {encoding: 'utf8', shell: true}
      );
      if (proc.status !== 0) {
        console.log('6 crash');
        return false;
      }
  
      const id = proc.stdout.trim();
      console.log(id);
      console.log('7');
      options.ssid = options.ssid.replace('"', '\\"');
      console.log(options.ssid);
      proc = this.childProcessService.childProcess.spawnSync(
        'sudo wpa_cli',
        // the ssid argument MUST be quoted
        ['-i', 'wlan0', 'set_network', id, 'ssid', `'"${options.ssid}"'`],
        {shell:true}
      );
      if (proc.status !== 0) {
        console.log('whoops');
        return false;
      }
      console.log('8');
      
      if (options.key) {
        options.key = options.key.replace('"', '\\"');
        console.log(options.key);
        proc = this.childProcessService.childProcess.spawnSync(
          'sudo wpa_cli',
          // the psk argument MUST be quoted
          ['-i', 'wlan0', 'set_network', id, 'psk', `'"${options.key}"'`],
          {shell:true}
        );
      } else {
        proc = this.childProcessService.childProcess.spawnSync(
          'sudo wpa_cli',
          ['-i', 'wlan0', 'set_network', id, 'key_mgmt', 'NONE'],
          {shell:true}
        );
      }
      console.log('9');
      if (proc.status !== 0) {
        return false;
      }
      console.log('10');
      proc = this.childProcessService.childProcess.spawnSync(
        'sudo wpa_cli',
        ['-i', 'wlan0', 'enable_network', id],
        {shell:true}
      );
      if (proc.status !== 0) {
        return false;
      }
      console.log('11');
      proc = this.childProcessService.childProcess.spawnSync(
        'sudo wpa_cli',
        ['-i', 'wlan0', 'save_config'],
        {shell:true}
      );
      if (proc.status !== 0) {
        return false;
      }
    }
    return true;
  }

  public connectNetwork(ssid1, pass) {
    console.log(pass);
    this.setWirelessMode(true, 'sta', {ssid: ssid1, key: pass});
  }

  public defineNetwork(ssid, pass) {
    this.defineWifi = this.wifiList.filter(obj => {return obj.ssid === ssid});
    if (pass) {
      this.changePage(6, 5, 'forward');
    } else {
      this.setWirelessMode(true, 'sta', {ssid});
    }
  }
}
