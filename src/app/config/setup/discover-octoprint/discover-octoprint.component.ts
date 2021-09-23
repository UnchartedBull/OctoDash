import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';

import { ElectronService } from '../../../electron.service';
import { URLSplit } from '../../config.model';
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
  public urlSplit: URLSplit;

  constructor(private configService: ConfigService, private electronService: ElectronService, private zone: NgZone) {}

  ngOnInit(): void {
    this.electronService.on('discoveredNodes', (_, nodes: OctoprintNodes) => {
      this.zone.run(() => {
        this.octoprintNodes = nodes;
      });
    });

    this.discoverOctoprintInstances();
  }

  ngOnDestroy(): void {
    this.electronService.send('stopDiscover');
  }

  private discoverOctoprintInstances(): void {
    this.octoprintNodes = null;
    this.electronService.send('discover');
    setTimeout(() => {
      const searching = document.querySelector('.discover-octoprint__searching');
      if (searching) {
        searching.innerHTML = $localize`:@@no-instance-found:no instances found.`;
        searching.classList.remove('loading-dots');
      }
    }, 10000);
  }

  public setOctoprintInstance(node: OctoprintNodes): void {
    const urlSplit = this.configService.splitOctoprintURL(node.url);
    if (node.local) {
      this.urlSplit = urlSplit;
    } else {
      this.emitOctoprintInstance(urlSplit);
    }
  }

  public emitLocalOctoprintInstance(urlSplit: URLSplit): void {
    this.emitOctoprintInstance({ host: 'localhost', port: urlSplit.port } as URLSplit);
  }

  public emitOctoprintInstance(urlSplit: URLSplit): void {
    this.octoprintHostChange.emit(urlSplit.host);
    this.octoprintPortChange.emit(urlSplit.port);
    this.urlSplit = undefined;
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
  local: boolean;
  disable: boolean;
}
