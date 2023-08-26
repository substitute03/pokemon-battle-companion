import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokeballSpinnerComponent } from './pokeball-spinner.component';

describe('PokeballSpinnerComponent', () => {
  let component: PokeballSpinnerComponent;
  let fixture: ComponentFixture<PokeballSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PokeballSpinnerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PokeballSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
