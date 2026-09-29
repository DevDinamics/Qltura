import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home.page';
import { By } from '@angular/platform-browser';
import { SeccionesDestacadasComponent } from '../components/secciones-destacadas/secciones-destacadas.component';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage] // Al ser Standalone, se importa directamente aquí
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create home page', () => {
    expect(component).toBeTruthy();
  });

  it('should render secciones destacadas component', () => {
    // Forma más robusta de verificar que el componente hijo se renderizó en el DOM
    const seccionesEl = fixture.debugElement.query(By.directive(SeccionesDestacadasComponent));
    expect(seccionesEl).toBeTruthy();
  });
});