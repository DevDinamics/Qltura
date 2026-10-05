import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReconocimientosPage } from './reconocimientos.page';

describe('ReconocimientosPage', () => {
  let component: ReconocimientosPage;
  let fixture: ComponentFixture<ReconocimientosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconocimientosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
