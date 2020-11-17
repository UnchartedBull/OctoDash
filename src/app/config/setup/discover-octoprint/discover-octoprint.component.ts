import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { ConfigService } from '../../config.service';

@Component({
  selector: 'app-config-setup-discover-octoprint',
  templateUrl: './discover-octoprint.component.html',
  styleUrls: ['./discover-octoprint.component.scss', '../setup.component.scss'],
})
export class DiscoverOctoprintComponent implements OnInit, OnDestroy {
  @Input() octoprintHost: number;
  @Input() octoprintPort: number;

  @Output() increasePage = new EventEmitter<void>();
  @Output() changeURLEntryMethod = new EventEmitter<boolean>();
  @Output() octoprintHostChange = new EventEmitter<string>();
  @Output() octoprintPortChange = new EventEmitter<number>();

  public manualURL = false;
  public octoprintNodes: OctoprintNodes;

  constructor(private configService: ConfigService, private electronService: ElectronService, private zone: NgZone) {}

  ngOnInit(): void {
    this.electronService.ipcRenderer.on('discoveredNodes', (_, nodes: OctoprintNodes) => {
      this.zone.run(() => {
        this.octoprintNodes = nodes;
      });
    });

    this.discoverOctoprintInstances();
  }

  ngOnDestroy(): void {
    this.electronService.ipcRenderer.send('stopDiscover');
  }

  private discoverOctoprintInstances(): void {
    this.octoprintNodes = null;
    this.electronService.ipcRenderer.send('discover');
    setTimeout(() => {
      const searching = document.querySelector('.discover-octoprint__searching');
      if (searching) {
        searching.innerHTML = 'no instances found.';
        searching.classList.remove('loading-dots');
      }
    }, 10000);
  }

  public setOctoprintInstance(node: OctoprintNodes): void {
    const urlSplit = this.configService.splitOctoprintURL(node.url);
    this.octoprintHostChange.emit(urlSplit.host);
    this.octoprintPortChange.emit(urlSplit.port);
    this.increasePage.emit();
  }

  public searchForInstance(): void {
    this.manualURL = false;
    this.changeURLEntryMethod.emit(this.manualURL);
  }

  public enterURLManually(): void {
    this.manualURL = true;
    this.changeURLEntryMethod.emit(this.manualURL);
  }
}

interface OctoprintNodes {
  id: number;
  name: string;
  version: string;
  url: string;
  disable: boolean;
}
