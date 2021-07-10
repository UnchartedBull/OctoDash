import { _getShadowRoot } from '@angular/cdk/platform';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss']
})
export class ConfirmComponent implements OnInit {
  public show: boolean;
  @Input() Question: string;
  @Input() Command?: string;
  @Input() 
  get Show(): boolean{
    return this.show;
  };
  set Show(value){
    this.show = value;
  };
  @Output() Ok = new EventEmitter();
  @Output() Cancel = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }
  okClicked(): void {
    this.Ok.emit();
    this.show = false;
  }
  cancelClicked(): void{
    this.show = false;
    this.Cancel.emit();
  }
}
