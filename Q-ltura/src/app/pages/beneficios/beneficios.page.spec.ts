import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BeneficiosPage } from './beneficios.page';

describe('BeneficiosPage', () => {
  let component: BeneficiosPage;
  let fixture: ComponentFixture<BeneficiosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BeneficiosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
