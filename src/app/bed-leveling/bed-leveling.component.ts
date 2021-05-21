import { stringify } from '@angular/compiler/src/util';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { PrinterProfile } from '../model';
import { PrinterService } from '../services/printer/printer.service';
import { ProfileService } from '../services/profiles/profiles.service';

@Component({
  selector: 'app-bed-leveling',
  templateUrl: './bed-leveling.component.html',
  styleUrls: ['./bed-leveling.component.scss']
})
export class BedLevelingComponent implements OnInit {
  public fadeOutAnimation = false;
  public isHomingNeeded = true;
  private currentProfile: PrinterProfile;
  private axisOffset: number = 15;
  @Output() closeFunction = new EventEmitter<void>();
  constructor(profileService: ProfileService, private printerService: PrinterService) {
    profileService.getProfiles().subscribe((profiles) =>{
        for( let profile of profiles){
          if (profile.current) {
            this.currentProfile = profile;
            break;
          }
        };
    });
  }

  ngOnInit(): void {

  }
  public hideScreen(): void {
    this.fadeOutAnimation = true;
    this.closeFunction.emit();
    setTimeout((): void => {
      this.fadeOutAnimation = false;
    }, 5000);
  }
  buttonClick(button:number): void{
    var command:string = null;
    switch (button) {
      case 0: // Home
        command = "G28;";
        this.isHomingNeeded = false
        break;
      case 1: // Front Left
        if (this.isHomingNeeded) break;
        command = "G0 Z10; "; // Raise Z by 10
        command += "G0 X" + this.axisOffset + " Y" + this.axisOffset + "; "; // Move to corner
        command += "G0 Z0;"; // Move Z to 0
        break;
      case 2: // Front Right
        if (this.isHomingNeeded) break;
        command = "G0 Z10  F6000; "; // Raise Z by 10
        command += "G0 X" + (this.currentProfile.volume.width - this.axisOffset) + " Y" + this.axisOffset + " F6000; "; // Move to corner
        command += "G0 Z0  F6000;"; // Move Z to 0
        break;
      case 3: // Rear Right
        if (this.isHomingNeeded) break;
        command = "G0 Z10 F6000; "; // Raise Z by 10
        command += "G0 X" + (this.currentProfile.volume.width - this.axisOffset) + " Y" + (this.currentProfile.volume.depth - this.axisOffset) + " F6000; "; // Move to corner
        command += "G0 Z0 F6000;"; // Move Z to 0
        break;
      case 4: // Rear Left
        if (this.isHomingNeeded) break;
        command = "G0 Z10 F6000; "; // Raise Z by 10
        command += "G0 X" + this.axisOffset + " Y" + (this.currentProfile.volume.depth - this.axisOffset) + " F6000; "; // Move to corner
        command += "G0 Z0;"; // Move Z to 0
        break;
      case 5: // Center
        if (this.isHomingNeeded) break;
        command = "G0 Z10 F6000; "; // Raise Z by 10
        command += "G0 X" + (this.currentProfile.volume.width / 2) + " Y" + (this.currentProfile.volume.depth / 2) + " F6000; "; // Move to corner
        command += "G0 Z0 F6000;"; // Move Z to 0
        break;
    }
    if (command != null){
      console.log( command);
      this.printerService.executeGCode(command);
    }
  }
}
