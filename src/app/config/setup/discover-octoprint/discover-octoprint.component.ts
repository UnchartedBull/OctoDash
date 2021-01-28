import { AfterViewInit, Component, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import Keyboard from 'simple-keyboard';

import { ConfigService } from '../../config.service';

@Component({
  selector: 'app-config-setup-discover-octoprint',
  templateUrl: './discover-octoprint.component.html',
  styleUrls: ['./discover-octoprint.component.scss', '../setup.component.scss'],
})
export class DiscoverOctoprintComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() octoprintHost: number;
  @Input() octoprintPort: number;

  @Output() increasePage = new EventEmitter<void>();
  @Output() changeURLEntryMethod = new EventEmitter<boolean>();
  @Output() octoprintHostChange = new EventEmitter<string>();
  @Output() octoprintPortChange = new EventEmitter<number>();

  public manualURL = false;
  public octoprintNodes: OctoprintNodes;
  public keyboard: Keyboard;

  constructor(private configService: ConfigService, private electronService: ElectronService, private zone: NgZone) {}

  ngOnInit(): void {
    this.electronService.ipcRenderer.on('discoveredNodes', (_, nodes: OctoprintNodes) => {
      this.zone.run(() => {
        this.octoprintNodes = nodes;
      });
    });

    this.discoverOctoprintInstances();
  }

  ngAfterViewInit(): void {
    console.log('Showing Keyboard');
    this.keyboard = new Keyboard({
      onChange: input => this.onChange(input),
      onKeyPress: button => this.onKeyPress(button),
      theme: 'hg-theme-default hg-theme-ios',
      layout: {
        default: [
          'q w e r t y u i o p {bksp}',
          'a s d f g h j k l {enter}',
          '{shift} z x c v b n m , . {shift}',
          '{alt} {smileys} {space} {altright} {downkeyboard}',
        ],
        shift: [
          'Q W E R T Y U I O P {bksp}',
          'A S D F G H J K L {enter}',
          '{shiftactivated} Z X C V B N M , . {shiftactivated}',
          '{alt} {smileys} {space} {altright} {downkeyboard}',
        ],
        alt: [
          '1 2 3 4 5 6 7 8 9 0 {bksp}',
          `@ # $ & * ( ) ' " {enter}`,
          '{shift} % - + = / ; : ! ? {shift}',
          '{default} {smileys} {space} {back} {downkeyboard}',
        ],
        smileys: [
          '😀 😊 😅 😂 🙂 😉 😍 😛 😠 😎 {bksp}',
          `😏 😬 😭 😓 😱 😪 😬 😴 😯 {enter}`,
          '😐 😇 🤣 😘 😚 😆 😡 😥 😓 🙄 {shift}',
          '{default} {smileys} {space} {altright} {downkeyboard}',
        ],
      },
      display: {
        '{alt}': '.?123',
        '{smileys}': '\uD83D\uDE03',
        '{shift}': '⇧',
        '{shiftactivated}': '⇧',
        '{enter}': 'return',
        '{bksp}': '⌫',
        '{altright}': '.?123',
        '{downkeyboard}': '⌄',
        '{space}': ' ',
        '{default}': 'ABC',
        '{back}': '⇦',
      },
    });
  }

  onChange = (input: string) => {
    console.log('Input changed', input);
  };

  onKeyPress = (button: string) => {
    console.log('Button pressed', button);

    if (button.includes('{') && button.includes('}')) {
      this.handleLayoutChange(button);
    }
  };

  handleLayoutChange(button): void {
    const currentLayout = this.keyboard.options.layoutName;
    let layoutName;

    switch (button) {
      case '{shift}':
      case '{shiftactivated}':
      case '{default}':
        layoutName = currentLayout === 'default' ? 'shift' : 'default';
        break;

      case '{alt}':
      case '{altright}':
        layoutName = currentLayout === 'alt' ? 'default' : 'alt';
        break;

      case '{smileys}':
        layoutName = currentLayout === 'smileys' ? 'default' : 'smileys';
        break;

      default:
        break;
    }

    if (layoutName) {
      this.keyboard.setOptions({
        layoutName: layoutName,
      });
    }
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
