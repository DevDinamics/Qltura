import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from '../components/navbar/navbar.component';
// 1. Importas el HeroSliderComponent (ajusta la ruta según la ubicación exacta de tu carpeta)
import { HeroSliderComponent } from '../components/hero-slider/hero-slider.component';
import { FeedDinamicoComponent } from '../components/feed-dinamico/feed-dinamico.component';
import { SeccionesDestacadasComponent } from '../components/secciones-destacadas/secciones-destacadas.component';
import { FooterComponent } from '../components/footer/footer.component';
import { UserGreetingComponent } from '../components/user-greeting/user-greeting.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  // 2. Lo agregas al arreglo de imports
  imports: [IonicModule, NavbarComponent, UserGreetingComponent, HeroSliderComponent, FeedDinamicoComponent, SeccionesDestacadasComponent, FooterComponent],
})
export class HomePage {
  loggedInUser = 'Diego'; // O puedes pasarlo dinámicamente desde tu AuthState
}

