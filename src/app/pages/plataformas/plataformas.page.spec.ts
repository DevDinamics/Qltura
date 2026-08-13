import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlataformasPage } from './plataformas.page';

describe('PlataformasPage', () => {
  let component: PlataformasPage;
  let fixture: ComponentFixture<PlataformasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PlataformasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
