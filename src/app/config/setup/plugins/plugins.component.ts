import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-config-setup-plugins',
  templateUrl: './plugins.component.html',
  styleUrls: ['./plugins.component.scss', '../setup.component.scss'],
})
export class PluginsComponent {
  @Input() displayLayerProgressPlugin: boolean;
  @Input() enclosurePlugin: boolean;
  @Input() filamentManagerPlugin: boolean;
  @Input() preheatButtonPlugin: boolean;
  @Input() printTimeGeniusPlugin: boolean;
  @Input() psuControlPlugin: boolean;

  @Output() displayLayerProgressPluginChange = new EventEmitter<boolean>();
  @Output() enclosurePluginChange = new EventEmitter<boolean>();
  @Output() filamentManagerPluginChange = new EventEmitter<boolean>();
  @Output() preheatButtonPluginChange = new EventEmitter<boolean>();
  @Output() printTimeGeniusPluginChange = new EventEmitter<boolean>();
  @Output() psuControlPluginChange = new EventEmitter<boolean>();

  public changeDisplayLayerProgressPlugin(): void {
    this.displayLayerProgressPlugin = !this.displayLayerProgressPlugin;
    this.displayLayerProgressPluginChange.emit(this.displayLayerProgressPlugin);
  }

  public changeEnclosurePlugin(): void {
    this.enclosurePlugin = !this.enclosurePlugin;
    this.enclosurePluginChange.emit(this.enclosurePlugin);
  }

  public changeFilamentManagerPlugin(): void {
    this.filamentManagerPlugin = !this.filamentManagerPlugin;
    this.filamentManagerPluginChange.emit(this.filamentManagerPlugin);
  }

  public changePreheatButtonPlugin(): void {
    this.preheatButtonPlugin = !this.preheatButtonPlugin;
    this.preheatButtonPluginChange.emit(this.preheatButtonPlugin);
  }

  public changePrintTimeGeniusPlugin(): void {
    this.printTimeGeniusPlugin = !this.printTimeGeniusPlugin;
    this.printTimeGeniusPluginChange.emit(this.printTimeGeniusPlugin);
  }

  public changePsuControlPlugin(): void {
    this.psuControlPlugin = !this.psuControlPlugin;
    this.psuControlPluginChange.emit(this.psuControlPlugin);
  }
}
