import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerationPickerComponent } from './generation-picker.component';

describe('GenerationPickerComponent', () => {
  let component: GenerationPickerComponent;
  let fixture: ComponentFixture<GenerationPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerationPickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GenerationPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
