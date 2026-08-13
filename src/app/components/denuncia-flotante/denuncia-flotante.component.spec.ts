import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DenunciaFlotanteComponent } from './denuncia-flotante.component';

describe('DenunciaFlotanteComponent', () => {
  let component: DenunciaFlotanteComponent;
  let fixture: ComponentFixture<DenunciaFlotanteComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DenunciaFlotanteComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DenunciaFlotanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
