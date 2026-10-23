import { 
  Component, 
  OnInit, 
  OnDestroy,
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  searchOutline, 
  closeCircle,
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

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    NavbarComponent,
    FooterComponent
  ]
})
export class PlataformasPage implements OnInit, OnDestroy {

  private readonly STORAGE_FAVORITES_KEY = 'q_ltura_fav_platforms';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  private _searchTerm: string = '';
  selectedCategory: string = 'Todas';

  readonly categories: string[] = ['Todas', 'Favoritos', 'Frecuentes', 'Herramientas', 'Recursos Humanos'];

  filteredPlataformas: Plataforma[] = [];

  // Catalogo base de herramientas
  plataformas: Plataforma[] = [
    {
      id: 'q-rewards',
      name: 'Q-Rewards',
      description: 'Plataforma de reconocimientos, puntos y beneficios corporativos.',
      category: 'Frecuentes',
      icon: 'gift-outline',
      colorTheme: 'orange',
      url: 'https://rewards.empresa.com',
      isFavorite: false,
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
      isFavorite: false,
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
      isFavorite: false,
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
      closeCircle,
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
    this.syncFavoritesFromStorage();

    // Sincronizacion con parametro de busqueda del navbar (?q=...)
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const query = params['q'] || '';
        this._searchTerm = query;
        this.updateFilteredPlataformas();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get searchTerm(): string {
    return this._searchTerm;
  }

  set searchTerm(val: string) {
    this._searchTerm = val;
    this.updateFilteredPlataformas();
  }

  public clearSearch(): void {
    this.searchTerm = '';
  }

  public filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.updateFilteredPlataformas();
  }

  // Alternar estado favorito y persistir
  public toggleFavorite(event: Event, item: Plataforma): void {
    event.stopPropagation();
    item.isFavorite = !item.isFavorite;
    this.saveFavoritesToStorage();
    this.updateFilteredPlataformas();
  }

  public openPlatform(item: Plataforma): void {
    if (item.url.startsWith('http')) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    } else {
      this.router.navigateByUrl(item.url);
    }
  }

  // Filtrado centralizado por busqueda, categoria o favoritos
  private updateFilteredPlataformas(): void {
    const term = this._searchTerm.toLowerCase().trim();

    this.filteredPlataformas = this.plataformas.filter(item => {
      let matchesCategory = true;

      if (this.selectedCategory === '⭐ Favoritos') {
        matchesCategory = !!item.isFavorite;
      } else if (this.selectedCategory !== 'Todas') {
        matchesCategory = item.category === this.selectedCategory;
      }

      const matchesSearch = !term || 
                            item.name.toLowerCase().includes(term) ||
                            item.description.toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });

    this.cdr.markForCheck();
  }

  // Persistencia local
  private syncFavoritesFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_FAVORITES_KEY);
      const favIds: string[] = stored ? JSON.parse(stored) : ['q-rewards', 'jira'];

      this.plataformas.forEach(p => {
        p.isFavorite = favIds.includes(p.id);
      });
    } catch {
      // Fallback a favoritos por defecto si falla el storage
      this.plataformas[0].isFavorite = true;
      this.plataformas[1].isFavorite = true;
    }
  }

  private saveFavoritesToStorage(): void {
    const favIds = this.plataformas.filter(p => p.isFavorite).map(p => p.id);
    localStorage.setItem(this.STORAGE_FAVORITES_KEY, JSON.stringify(favIds));
  }

  public trackByPlatform(index: number, item: Plataforma): string {
    return item.id;
  }

  public trackByCategory(index: number, category: string): string {
    return category;
  }
}