import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrinterStatusComponent } from './printer-status.component';

describe('PrinterStatusComponent', () => {
  let component: PrinterStatusComponent;
  let fixture: ComponentFixture<PrinterStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrinterStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrinterStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
