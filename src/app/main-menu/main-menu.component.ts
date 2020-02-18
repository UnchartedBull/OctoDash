import { Component } from '@angular/core';

@Component({
    selector: 'app-main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['./main-menu.component.scss'],
})
export class MainMenuComponent {
    public settings = false;

    public constructor() {}

    public showSettings(): void {
        this.settings = true;
    }

    public hideSettings(): void {
        setTimeout((): void => {
            this.settings = false;
        }, 600);
    }
}
