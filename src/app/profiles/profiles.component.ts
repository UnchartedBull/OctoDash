import { Component, EventEmitter, NgZone, OnInit, Output } from '@angular/core';
import { faLowVision } from '@fortawesome/free-solid-svg-icons';
import { PrinterProfile } from '../model';
import { ProfileService } from '../services/profiles/profiles.service';
import { SystemService } from '../services/system/system.service';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss']
})
export class ProfilesComponent implements OnInit {
  public fadeOutAnimation = false;
  public profiles: Array<PrinterProfile>;
  public reading: boolean = true;
  public confirm: boolean = false;
  public question: string = $localize`:@@profile-change-question:This action will re-connect the printer. Any ongoing activity will be disrupted.`;
  private currentProfile: string;
  private changedProfile: string;
  @Output() closeFunction = new EventEmitter<void>();
  public constructor(
    private profileService: ProfileService,
    private systemService: SystemService,
    private ngzone: NgZone
  ){
    this.profileService.getProfiles().subscribe((profiles) =>{
      this.ngzone.run(()=>{
        this.reading = false;
        this.profiles = profiles
        for( let profile of this.profiles){
          if (profile.current) {
            this.currentProfile = profile.id;
            break;
          }
        };
      })
    });
  }

  ngOnInit(): void {

  }
  public hideProfiles(): void {
      this.fadeOutAnimation = true;
      this.closeFunction.emit();
      setTimeout((): void => {
        this.fadeOutAnimation = false;
      }, 5000);
  }
  public onProfileClick(i:number): void {
    for( let profile of this.profiles){
        if (profile.current) {
        profile.current = false;
        break;
        }
    };
    this.profiles[i].current = true;
    this.changedProfile = this.profiles[i].id; 
    }
  public save(): void {
    if (this.currentProfile != this.changedProfile){
      this.confirm = true;
    }
  }
  public onConfirmation(): void {
    this.systemService.disconnetPrinter();
    this.systemService.connectPrinter(this.changedProfile);
    this.hideProfiles();
    this.confirm = false;
  }

  public onCancel(): void{
    this.confirm = false;
  }
}
