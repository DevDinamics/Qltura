import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import { 
  peopleOutline, 
  calendarOutline, 
  cloudOutline, 
  trophyOutline, 
  alertCircle, 
  alertCircleOutline, 
  informationCircleOutline, 
  arrowForwardOutline,
  videocamOutline,
  videocam,
  timeOutline,
  sparklesOutline,
  bookmarkOutline,
  notificationsOutline,
  notificationsOffOutline
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { SanityService } from '../../services/sanity.service';
import { ReminderService } from '../../services/reminder.service';

export interface FeedItem {
  id: string;
  icon: string;
  title: string;
  category: string;
  date: string;
  priority: 'high' | 'medium' | 'info';
  targetTab: 'oficiales' | 'feed';
}

export interface ReminderFeedItem {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  timeRange: string;
  location: string;
  categoryLabel: string;
  isOnline: boolean;
  meetingUrl?: string;
  daysRemainingText: string;
  motivationalText: string;
  isToday: boolean;
  isPast: boolean;
}

@Component({
  selector: 'app-feed-dinamico',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './feed-dinamico.component.html',
  styleUrls: ['./feed-dinamico.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedDinamicoComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private authService = inject(AuthService);
  private sanityService = inject(SanityService);
  private reminderService = inject(ReminderService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  activeTab: 'oficial' | 'q-experience' | 'recordatorios' = 'oficial';
  currentCompany: string = 'Qualtop';

  reminderEvents: ReminderFeedItem[] = [];
  isLoadingReminders: boolean = false;

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
      title: '¡Nos vemos el martes! Celebremos a los cumpleañeros del mes',
      category: 'Cultura & Eventos',
      date: 'Hace 2 horas',
      priority: 'info',
      targetTab: 'feed'
    }
  ];

  constructor() {
    addIcons({
      peopleOutline,
      calendarOutline,
      cloudOutline,
      trophyOutline,
      alertCircle,
      alertCircleOutline,
      informationCircleOutline,
      arrowForwardOutline,
      videocamOutline,
      videocam,
      timeOutline,
      sparklesOutline,
      bookmarkOutline,
      notificationsOutline,
      notificationsOffOutline
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user?.company) {
          this.currentCompany = user.company;
        }
        this.syncReminders();
      });

    // Escuchar adición o eliminación de recordatorios en tiempo real
    this.reminderService.reminderIds$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.syncReminders();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setTab(tab: 'oficial' | 'q-experience' | 'recordatorios'): void {
    this.activeTab = tab;
  }

  get currentItems(): FeedItem[] {
    return this.activeTab === 'oficial' ? this.oficialItems : this.experienceItems;
  }

  get reminderCount(): number {
    return this.reminderEvents.length;
  }

  async syncReminders(): Promise<void> {
    const ids = this.reminderService.reminderIds;
    if (!ids || ids.length === 0) {
      this.reminderEvents = [];
      this.cdr.markForCheck();
      return;
    }

    this.isLoadingReminders = true;
    this.cdr.markForCheck();

    try {
      const query = `*[
        _type == "activity" && 
        _id in $ids && 
        !(_id in path("drafts.**")) && 
        (lower(company) == lower($company) || company == "Ambas")
      ] | order(eventDate asc) {
        "id": _id,
        title,
        description,
        eventDate,
        timeRange,
        location,
        categoryLabel,
        "isOnline": isOnline
      }`;

      const raw = await this.sanityService.fetchQuery<any[]>(query, {
        ids,
        company: this.currentCompany
      });

      if (raw && raw.length > 0) {
        this.reminderEvents = raw.map(item => {
          const timing = this.calculateDaysRemaining(item.eventDate);
          const link = this.extractUrl(item.location);

          return {
            id: item.id,
            title: item.title,
            description: item.description,
            eventDate: item.eventDate,
            timeRange: item.timeRange || '',
            location: item.location || 'Remoto',
            categoryLabel: item.categoryLabel || 'Corporativo',
            isOnline: !!item.isOnline,
            meetingUrl: link,
            daysRemainingText: timing.label,
            motivationalText: timing.motivational,
            isToday: timing.isToday,
            isPast: timing.isPast
          };
        });
      } else {
        this.reminderEvents = [];
      }
    } catch (e) {
      console.error('Error al sincronizar recordatorios en Feed Dinámico:', e);
      this.reminderEvents = [];
    } finally {
      this.isLoadingReminders = false;
      this.cdr.markForCheck();
    }
  }

  private calculateDaysRemaining(eventDateStr: string): { 
    label: string; 
    motivational: string; 
    isToday: boolean; 
    isPast: boolean 
  } {
    if (!eventDateStr) {
      return { label: 'Próximamente', motivational: '¡Mantente al tanto!', isToday: false, isPast: false };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(eventDateStr);
    const target = new Date(eventDate);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        label: 'Finalizado', 
        motivational: 'Evento concluido', 
        isToday: false, 
        isPast: true 
      };
    } else if (diffDays === 0) {
      return { 
        label: 'HOY', 
        motivational: '¡Es hoy! Todo listo para conectarte', 
        isToday: true, 
        isPast: false 
      };
    } else if (diffDays === 1) {
      return { 
        label: 'Mañana', 
        motivational: '¡Casi listos! Recuerda apartar tu espacio', 
        isToday: false, 
        isPast: false 
      };
    } else {
      return { 
        label: `Faltan ${diffDays} días`, 
        motivational: '¡Agéndalo con tiempo! Te esperamos', 
        isToday: false, 
        isPast: false 
      };
    }
  }

  private extractUrl(locationText?: string): string | undefined {
    if (!locationText) return undefined;
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const match = locationText.match(urlPattern);
    return match ? match[0] : undefined;
  }

  openSessionUrl(url: string | undefined, event: MouseEvent): void {
    event.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  removeReminder(eventId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.reminderService.toggleReminder(eventId);
  }

  getPriorityIcon(priority: 'high' | 'medium' | 'info'): string {
    switch (priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert-circle-outline';
      case 'info': return 'information-circle-outline';
      default: return 'information-circle-outline';
    }
  }

  goToAvisos(): void {
    this.router.navigate(['/avisos']);
  }

  goToItemDetail(item: FeedItem): void {
    this.router.navigate(['/avisos'], { 
      queryParams: { 
        tab: item.targetTab,
        postId: item.id 
      } 
    });
  }
}