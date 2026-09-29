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

  activeView: 'agenda' | 'mes' = 'agenda';
  selectedFilter: 'ALL' | 'birthday' | 'culture' | 'tech' = 'ALL';
  currentCompany: string = 'Qualtop';

  events: CalendarEvent[] = [];

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
    // Escuchar el usuario activo de la sesión para filtrar por su empresa
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user && user.company) {
          this.currentCompany = user.company;
        }
        this.fetchActivitiesFromSanity();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async fetchActivitiesFromSanity(): Promise<void> {
    try {
      const query = `*[_type == "activity" && (company == $company || company == "Ambas")] | order(eventDate asc) {
        "id": _id,
        title,
        description,
        eventDate,
        timeRange,
        location,
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
            isVirtual: item.isVirtual ?? false,
            isConfirmed: false
          };
        });
      }

      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error al cargar actividades desde Sanity:', error);
    }
  }

  get filteredEvents(): CalendarEvent[] {
    if (this.selectedFilter === 'ALL') {
      return this.events;
    }
    return this.events.filter(e => e.type === this.selectedFilter);
  }

  async toggleConfirmEvent(event: CalendarEvent): Promise<void> {
    event.isConfirmed = !event.isConfirmed;
    this.cdr.markForCheck();

    const msg = event.isConfirmed 
      ? `Añadido a tus recordatorios: ${event.title}` 
      : 'Recordatorio removido';

    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 2000,
      color: event.isConfirmed ? 'success' : 'medium',
      position: 'top',
      mode: 'ios'
    });
    await toast.present();
  }
}