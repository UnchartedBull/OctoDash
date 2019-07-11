import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerProgressComponent } from './layer-progress.component';

describe('LayerProgressComponent', () => {
  let component: LayerProgressComponent;
  let fixture: ComponentFixture<LayerProgressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayerProgressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
