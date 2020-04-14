import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InterpolatorComponent } from './interpolator.component';

describe('InterpolatorComponent', () => {
  let component: InterpolatorComponent;
  let fixture: ComponentFixture<InterpolatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InterpolatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InterpolatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
