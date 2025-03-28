import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';

import { ElectronService } from '../../../electron.service';
import { URLSplit } from '../../../model';
import { isOctoprintVersionGood } from '../../../services/printer/printer.octoprint.service';
import { ConfigService } from '../../config.service';

@Component({
  selector: 'app-config-setup-discover-octoprint',
  templateUrl: './discover-octoprint.component.html',
  styleUrls: ['./discover-octoprint.component.scss', '../setup.component.scss'],
  standalone: false,
})
export class DiscoverOctoprintComponent implements OnInit, OnDestroy {
  @Input() octoprintURL: string;

  @Output() increasePage = new EventEmitter<void>();
  @Output() changeURLEntryMethod = new EventEmitter<boolean>();
  @Output() octoprintURLChange = new EventEmitter<string>();

  public manualURL = false;
  public octoprintNodes: OctoprintNode[];
  public urlSplit: URLSplit;

  constructor(
    private configService: ConfigService,
    private electronService: ElectronService,
    private zone: NgZone,
  ) {
    this.urlSplit = { host: 'localhost', port: 5000 };
  }

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
    this.urlSplit = urlSplit;
    this.emitOctoprintInstance();
    this.increasePage.emit();
  }

  public changeHost(host: string) {
    this.urlSplit.host = host;
    this.octoprintURLChange.emit(this.configService.mergeOctoprintURL(this.urlSplit));
  }

  public changePort(port: number) {
    this.urlSplit.port = port;
    this.octoprintURLChange.emit(this.configService.mergeOctoprintURL(this.urlSplit));
  }

  public emitOctoprintInstance(): void {
    this.octoprintURLChange.emit(this.configService.mergeOctoprintURL(this.urlSplit));
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
