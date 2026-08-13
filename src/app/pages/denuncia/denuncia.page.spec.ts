import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DenunciaPage } from './denuncia.page';

describe('DenunciaPage', () => {
  let component: DenunciaPage;
  let fixture: ComponentFixture<DenunciaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DenunciaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
