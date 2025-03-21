import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';

import { ElectronService } from '../../../electron.service';
import { isOctoprintVersionGood } from '../../../services/printer/printer.octoprint.service';
import { ConfigService, URLSplit } from '../../config.service';

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
  public octoprintNodes: OctoprintNode[];
  public urlSplit: URLSplit;

  constructor(
    private configService: ConfigService,
    private electronService: ElectronService,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.electronService.on('discoveredNodes', (_, nodes: OctoprintNode[]) => {
      this.zone.run(() => {
        this.octoprintNodes = nodes.map(n => ({
          ...n,
          disabled: !isOctoprintVersionGood(n.version),
        }));
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

  public setOctoprintInstance(node: OctoprintNode): void {
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

interface OctoprintNode {
  id: number;
  name: string;
  version: string;
  url: string;
  local: boolean;
  disabled?: boolean;
}
