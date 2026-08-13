import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  peopleOutline, 
  calendarOutline, 
  cloudOutline, 
  trophyOutline, 
  alertCircle, 
  alertCircleOutline, 
  informationCircleOutline, 
  arrowForwardOutline 
} from 'ionicons/icons';

export interface FeedItem {
  id: string;
  icon: string;
  title: string;
  category: string;
  date: string;
  priority: 'high' | 'medium' | 'info';
  targetTab: 'oficiales' | 'feed'; // A qué pestaña de la página Avisos pertenece
}

@Component({
  selector: 'app-feed-dinamico',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './feed-dinamico.component.html',
  styleUrls: ['./feed-dinamico.component.scss']
})
export class FeedDinamicoComponent implements OnInit {

  activeTab: 'oficial' | 'q-experience' = 'oficial';

  oficialItems: FeedItem[] = [
    {
      id: 'post-oficial-1',
      icon: 'people-outline',
      title: 'Cambio de personal en el equipo de Delivery',
      category: 'Área: Delivery',
      date: '19 may 2025',
      priority: 'high',
      targetTab: 'oficiales'
    },
    {
      id: 'post-oficial-2',
      icon: 'calendar-outline',
      title: 'Días de asueto – Junio 2025',
      category: 'RRHH',
      date: '18 may 2025',
      priority: 'medium',
      targetTab: 'oficiales'
    },
    {
      id: 'post-oficial-3',
      icon: 'cloud-outline',
      title: 'Comunicado SGI – Actualización de políticas',
      category: 'SGI',
      date: '17 may 2025',
      priority: 'info',
      targetTab: 'oficiales'
    }
  ];

  experienceItems: FeedItem[] = [
    {
      id: 'post-1',
      icon: 'trophy-outline',
      title: '¡¡Nos vemos el martes! Celebremos con los cumpleañeros de julio',
      category: 'Cultura & Eventos',
      date: 'Hace 2 horas',
      priority: 'info',
      targetTab: 'feed'
    }
  ];

  constructor(private router: Router) {
    addIcons({
      'people-outline': peopleOutline,
      'calendar-outline': calendarOutline,
      'cloud-outline': cloudOutline,
      'trophy-outline': trophyOutline,
      'alert-circle': alertCircle,
      'alert-circle-outline': alertCircleOutline,
      'information-circle-outline': informationCircleOutline,
      'arrow-forward-outline': arrowForwardOutline
    });
  }

  ngOnInit(): void {}

  setTab(tab: 'oficial' | 'q-experience') {
    this.activeTab = tab;
  }

  get currentItems(): FeedItem[] {
    return this.activeTab === 'oficial' ? this.oficialItems : this.experienceItems;
  }

  getPriorityIcon(priority: 'high' | 'medium' | 'info'): string {
    switch (priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert-circle-outline';
      case 'info': return 'information-circle-outline';
      default: return 'information-circle-outline';
    }
  }

  // Navegar a la sección de avisos con la pestaña seleccionada
  goToAvisos() {
    const tabToOpen = this.activeTab === 'oficial' ? 'oficiales' : 'feed';
    this.router.navigate(['/avisos'], { queryParams: { tab: tabToOpen } });
  }

  // Navegar directamente al aviso individual dentro de la vista
  goToItemDetail(item: FeedItem) {
    this.router.navigate(['/avisos'], { 
      queryParams: { 
        tab: item.targetTab,
        postId: item.id 
      } 
    });
  }

}