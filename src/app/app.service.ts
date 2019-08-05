import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private updateError: string[];

  constructor() {
    this.updateError = ['. should have required property \'octodash\''];
  }

  public getUpdateError(): string[] {
    return this.updateError;
  }

  // If the errors can be automatically fixed return true here
  public autoFixError(): boolean {
    return false;
  }

}
