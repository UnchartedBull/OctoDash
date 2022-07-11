import { Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { UrlHelper } from 'src/app/helper/url.helper';

import { ElectronService } from '../../../electron.service';
import { BackendType, URLSplit } from '../../config.model';

@Component({
  selector: 'app-config-setup-discover-backend',
  templateUrl: './discover-backend.component.html',
  styleUrls: ['./discover-backend.component.scss', '../setup.component.scss'],
})
export class DiscoverBackendComponent implements OnInit, OnDestroy {
  @Input() backend: string;
  @Input() backendType: BackendType;

  @Output() increasePage = new EventEmitter<void>();
  @Output() changeURLEntryMethod = new EventEmitter<boolean>();
  @Output() backendChange = new EventEmitter<string>();

  public manualURL = false;
  public nodes: Nodes;
  public urlSplit: URLSplit;
  public showLocalDialog: boolean;
  public backendTypeEnum = BackendType;

  private noInstanceTimeout: ReturnType<typeof setTimeout>;

  constructor(private electronService: ElectronService, private zone: NgZone) {}

  ngOnInit(): void {
    this.urlSplit = UrlHelper.splitUrl(this.backend);

    this.electronService.on('discoveredNodes', (_, nodes: Nodes) => {
      this.zone.run(() => {
        this.nodes = nodes;
      });
    });

    this.discoverNodes();
  }

  ngOnDestroy(): void {
    clearTimeout(this.noInstanceTimeout);
    this.electronService.send('stopDiscover');
  }

  private discoverNodes(): void {
    this.nodes = null;
    this.electronService.send('discover', this.backendType.toLowerCase());

    this.noInstanceTimeout = setTimeout(() => {
      const searching = document.querySelector('.discover-backend__searching');
      if (searching) {
        searching.innerHTML = $localize`:@@no-instance-found:no instances found.`;
        searching.classList.remove('loading-dots');
      }
    }, 10000);
  }

  public chooseNode(node: Nodes): void {
    this.urlSplit = UrlHelper.splitUrl(node.url);
    if (node.local) {
      this.showLocalDialog = true;
    } else {
      this.emitNode(true);
    }
  }

  public chooseLocalInstance(urlSplit: URLSplit): void {
    this.urlSplit = { host: 'localhost', port: urlSplit.port };
    this.emitNode(true);
  }

  public emitNode(nextPage = false): void {
    this.showLocalDialog = false;
    this.backendChange.emit(UrlHelper.mergeUrl(this.urlSplit));
    if (nextPage) {
      this.increasePage.emit();
    }
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

interface Nodes {
  id: number;
  name: string;
  version: string;
  url: string;
  local: boolean;
  disable: boolean;
}
