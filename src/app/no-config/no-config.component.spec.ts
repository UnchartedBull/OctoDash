import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoConfigComponent } from './no-config.component';

describe('NoConfigComponent', () => {
  let component: NoConfigComponent;
  let fixture: ComponentFixture<NoConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
