import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DamageMultipliersComponent } from './damage-multipliers.component';

describe('DamageMultipliersComponent', () => {
  let component: DamageMultipliersComponent;
  let fixture: ComponentFixture<DamageMultipliersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DamageMultipliersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DamageMultipliersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
