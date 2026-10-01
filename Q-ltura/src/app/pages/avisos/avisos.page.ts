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
import { IonicModule, ToastController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';
import { SanityService } from '../../services/sanity.service';
import { ReminderService } from '../../services/reminder.service';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, 
  timeOutline, 
  locationOutline, 
  notificationsOutline,
  notifications,
  chevronBackOutline,
  chevronForwardOutline,
  videocamOutline,
  giftOutline,
  sparklesOutline,
  businessOutline
} from 'ionicons/icons';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  dayNumber: string;
  monthShort: string;
  fullDateText: string;
  time: string;
  location: string;
  type: 'birthday' | 'culture' | 'tech' | 'official';
  badgeLabel: string;
  company: 'Qualtop' | 'SYE' | 'Ambas';
  isVirtual?: boolean;
  isConfirmed?: boolean;
}

@Component({
  selector: 'app-avisos',
  templateUrl: './avisos.page.html',
  styleUrls: ['./avisos.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FooterComponent
  ]
})
export class AvisosPage implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  private toastCtrl = inject(ToastController);
  private authService = inject(AuthService);
  private sanityService = inject(SanityService);
  private reminderService = inject(ReminderService);

  activeView: 'agenda' | 'mes' = 'agenda';
  selectedFilter: 'ALL' | 'birthday' | 'culture' | 'tech' = 'ALL';
  currentCompany: string = 'Qualtop';

  events: CalendarEvent[] = [];
  isLoading: boolean = true; 
  skeletonArray = [1, 2, 3]; 

  // --- CONFIGURACIÓN DE PAGINACIÓN MINIMALISTA ---
  readonly pageSize: number = 5;
  currentPage: number = 1;

  constructor() {
    addIcons({
      calendarOutline,
      timeOutline,
      locationOutline,
      notificationsOutline,
      notifications,
      chevronBackOutline,
      chevronForwardOutline,
      videocamOutline,
      giftOutline,
      sparklesOutline,
      businessOutline
    });
  }

  ngOnInit(): void {
    // 1. Escuchar la sesión activa (filtra por filial: Qualtop o SYE)
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user && user.company) {
          this.currentCompany = user.company;
        }
        this.fetchActivitiesFromSanity();
      });

    // 2. Sincronización bidireccional de recordatorios con el Feed Dinámico
    this.reminderService.reminderIds$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ids) => {
        if (this.events.length > 0) {
          this.events.forEach(event => {
            event.isConfirmed = ids.includes(event.id);
          });
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async fetchActivitiesFromSanity(): Promise<void> {
    this.isLoading = true;
    this.currentPage = 1;
    this.cdr.markForCheck();

    try {
      const query = `*[
        _type == "activity" && 
        !(_id in path("drafts.**")) && 
        (lower(company) == lower($company) || company == "Ambas")
      ] | order(eventDate desc) {
        "id": _id,
        title,
        description,
        eventDate,
        timeRange,
        location,
        company,
        "type": category,
        "badgeLabel": categoryLabel,
        "isVirtual": isOnline
      }`;

      const rawData = await this.sanityService.fetchQuery<any[]>(query, {
        company: this.currentCompany
      });

      if (rawData && rawData.length > 0) {
        const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

        this.events = rawData.map((item) => {
          const dateObj = new Date(item.eventDate);
          const hasValidDate = !isNaN(dateObj.getTime());

          return {
            id: item.id,
            title: item.title,
            description: item.description,
            dayNumber: hasValidDate ? String(dateObj.getDate()).padStart(2, '0') : '--',
            monthShort: hasValidDate ? months[dateObj.getMonth()] : 'ACT',
            fullDateText: item.timeRange || (hasValidDate ? dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) : ''),
            time: item.timeRange ? '' : (hasValidDate ? dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''),
            location: item.location || 'Remoto / En línea',
            type: item.type || 'culture',
            badgeLabel: item.badgeLabel || 'Actividad Corporativa',
            company: item.company || 'Ambas',
            isVirtual: item.isVirtual ?? false,
            // Consulta el estado guardado en ReminderService
            isConfirmed: this.reminderService.isReminded(item.id)
          };
        });
      } else {
        this.events = [];
      }
    } catch (error) {
      console.error('Error al cargar actividades desde Sanity:', error);
      this.events = [];
    } finally {
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }, 500);
    }
  }

  // --- FILTRADO Y PAGINACIÓN ---
  get filteredEvents(): CalendarEvent[] {
    if (this.selectedFilter === 'ALL') {
      return this.events;
    }
    return this.events.filter(e => e.type === this.selectedFilter);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredEvents.length / this.pageSize) || 1;
  }

  get paginatedEvents(): CalendarEvent[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredEvents.slice(startIndex, startIndex + this.pageSize);
  }

  public setFilter(filter: 'ALL' | 'birthday' | 'culture' | 'tech'): void {
    this.selectedFilter = filter;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  public prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.scrollToTop();
      this.cdr.markForCheck();
    }
  }

  public nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.scrollToTop();
      this.cdr.markForCheck();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async toggleConfirmEvent(event: CalendarEvent): Promise<void> {
    // Guarda o remueve en ReminderService y sincroniza el Feed dinámico
    const isNowConfirmed = this.reminderService.toggleReminder(event.id);
    event.isConfirmed = isNowConfirmed;
    this.cdr.markForCheck();

    const msg = isNowConfirmed 
      ? `Añadido a tus recordatorios: ${event.title}` 
      : 'Recordatorio removido';

    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: isNowConfirmed ? 'success' : 'medium',
      position: 'top',
      mode: 'ios'
    });
    await toast.present();
  }
}