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
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, 
  timeOutline, 
  locationOutline, 
  notificationsOutline,
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
  fullDateText: string; // ej: "Martes, 28 de Julio • 10:30 AM"
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
    NavbarComponent,
    FooterComponent
  ]
})
export class AvisosPage implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  private toastCtrl = inject(ToastController);

  activeView: 'agenda' | 'mes' = 'agenda';
  selectedFilter: 'ALL' | 'birthday' | 'culture' | 'tech' = 'ALL';

  events: CalendarEvent[] = [
    {
      id: 'evt-1',
      title: 'Celebremos a los cumpleañeros de Julio',
      description: 'Festejemos a nuestros cumpleañeros del mes en la oficina. Habrá pastel, sorpresas y convivencia de equipo.',
      dayNumber: '28',
      monthShort: 'JUL',
      fullDateText: 'Martes, 28 de Julio',
      time: '10:30 AM - 11:00 AM',
      location: 'Oficinas Parque Lira • Comedor',
      type: 'birthday',
      badgeLabel: 'Festejo & Cultura',
      isVirtual: false,
      isConfirmed: false
    },
    {
      id: 'evt-2',
      title: 'Ventana de Mantenimiento SGI & Servidores',
      description: 'Actualización programada de seguridad en infraestructura central. Los servicios se restablecerán a mediodía.',
      dayNumber: '02',
      monthShort: 'AGO',
      fullDateText: 'Domingo, 02 de Agosto',
      time: '01:00 AM - 05:00 AM',
      location: 'Microsoft Teams / Remoto',
      type: 'tech',
      badgeLabel: 'Sistemas & TI',
      isVirtual: true,
      isConfirmed: true
    },
    {
      id: 'evt-3',
      title: 'Town Hall Q-ltura: Resultados Q3',
      description: 'Reunión trimestral de alineación estratégica con los equipos de Qualtop y SYE.',
      dayNumber: '15',
      monthShort: 'AGO',
      fullDateText: 'Viernes, 15 de Agosto',
      time: '11:00 AM - 12:30 PM',
      location: 'Auditorio Principal + Transmisión En Vivo',
      type: 'official',
      badgeLabel: 'Oficial & Estrategia',
      isVirtual: true,
      isConfirmed: false
    }
  ];

  constructor() {
    addIcons({
      calendarOutline,
      timeOutline,
      locationOutline,
      notificationsOutline,
      chevronBackOutline,
      chevronForwardOutline,
      videocamOutline,
      giftOutline,
      sparklesOutline,
      businessOutline
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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