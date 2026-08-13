import { 
  Component, 
  OnInit, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { addIcons } from 'ionicons';
import { 
  searchOutline, 
  giftOutline, 
  layersOutline, 
  gitNetworkOutline, 
  peopleOutline, 
  bookOutline, 
  calendarOutline, 
  openOutline,
  star,
  starOutline,
  sparklesOutline
} from 'ionicons/icons';

export interface Plataforma {
  id: string;
  name: string;
  description: string;
  category: 'Frecuentes' | 'Herramientas' | 'Recursos Humanos';
  icon: string;
  colorTheme: 'orange' | 'purple' | 'blue' | 'green';
  url: string;
  isFavorite?: boolean;
  status?: 'online' | 'maintenance';
}

@Component({
  selector: 'app-plataformas',
  templateUrl: './plataformas.page.html',
  styleUrls: ['./plataformas.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // ⚡ Renderizado ultra fluido sin trabajo extra
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NavbarComponent,
    FooterComponent
  ]
})
export class PlataformasPage implements OnInit {

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  private _searchTerm: string = '';
  selectedCategory: string = 'Todas';

  categories: string[] = ['Todas', 'Frecuentes', 'Herramientas', 'Recursos Humanos'];

  // Arreglo de tarjetas filtradas pre-calculadas en memoria
  filteredPlataformas: Plataforma[] = [];

  plataformas: Plataforma[] = [
    {
      id: 'q-rewards',
      name: 'Q-Rewards',
      description: 'Plataforma de reconocimientos, puntos y beneficios corporativos.',
      category: 'Frecuentes',
      icon: 'gift-outline',
      colorTheme: 'orange',
      url: 'https://rewards.empresa.com',
      isFavorite: true,
      status: 'online'
    },
    {
      id: 'jira',
      name: 'Confluence / Jira',
      description: 'Gestión de proyectos, seguimiento de tareas y documentación técnica.',
      category: 'Herramientas',
      icon: 'layers-outline',
      colorTheme: 'blue',
      url: 'https://jira.empresa.com',
      isFavorite: true,
      status: 'online'
    },
    {
      id: 'organigrama',
      name: 'Organigrama',
      description: 'Estructura organizacional, áreas y jerarquías del equipo.',
      category: 'Recursos Humanos',
      icon: 'git-network-outline',
      colorTheme: 'green',
      url: '/organigrama',
      isFavorite: false,
      status: 'online'
    },
    {
      id: 'directorio',
      name: 'Directorio de contactos',
      description: 'Encuentra correos, extensiones y teléfonos de colaboradores.',
      category: 'Recursos Humanos',
      icon: 'people-outline',
      colorTheme: 'orange',
      url: '/directorio',
      isFavorite: false,
      status: 'online'
    },
    {
      id: 'sgi',
      name: 'Biblioteca SGI',
      description: 'Políticas oficiales, procedimientos, normas y manuales SGI.',
      category: 'Herramientas',
      icon: 'book-outline',
      colorTheme: 'purple',
      url: '/politicas',
      isFavorite: true,
      status: 'online'
    },
    {
      id: 'calendario',
      name: 'Calendario de actividades',
      description: 'Eventos corporativos, sesiones informativas y fechas clave.',
      category: 'Frecuentes',
      icon: 'calendar-outline',
      colorTheme: 'orange',
      url: '/eventos',
      isFavorite: false,
      status: 'online'
    }
  ];

  constructor() {
    addIcons({
      searchOutline,
      giftOutline,
      layersOutline,
      gitNetworkOutline,
      peopleOutline,
      bookOutline,
      calendarOutline,
      openOutline,
      star,
      starOutline,
      sparklesOutline
    });
  }

  ngOnInit(): void {
    this.updateFilteredPlataformas();
  }

  // Getter y Setter para recalcular el filtro solo al cambiar la búsqueda
  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(val: string) {
    this._searchTerm = val;
    this.updateFilteredPlataformas();
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.updateFilteredPlataformas();
  }

  toggleFavorite(event: Event, item: Plataforma): void {
    event.stopPropagation();
    item.isFavorite = !item.isFavorite;
    this.cdr.markForCheck();
  }

  openPlatform(item: Plataforma): void {
    if (item.url.startsWith('http')) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      this.router.navigateByUrl(item.url); // 🚀 Navegación SPA nativa de Angular
    }
  }

  // Lógica centralizada de filtrado sin sobrecargar el hilo principal
  private updateFilteredPlataformas(): void {
    const term = this._searchTerm.toLowerCase().trim();
    
    this.filteredPlataformas = this.plataformas.filter(item => {
      const matchesCategory = this.selectedCategory === 'Todas' || item.category === this.selectedCategory;
      const matchesSearch = !term || 
                            item.name.toLowerCase().includes(term) ||
                            item.description.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });

    this.cdr.markForCheck();
  }

}