import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SeccionesDestacadasComponent } from './secciones-destacadas.component';

describe('SeccionesDestacadasComponent', () => {
  let component: SeccionesDestacadasComponent;
  let fixture: ComponentFixture<SeccionesDestacadasComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SeccionesDestacadasComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SeccionesDestacadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
