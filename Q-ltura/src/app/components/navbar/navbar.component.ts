import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  inject 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { 
  IonHeader, 
  IonToolbar, 
  IonIcon, 
  IonTabBar, 
  IonTabButton, 
  IonLabel, 
  IonPopover,
  ToastController 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  searchOutline, 
  notificationsOutline, 
  notifications,
  notificationsOffOutline,
  homeOutline, 
  newspaperOutline, 
  gridOutline, 
  shieldCheckmarkOutline, 
  menuOutline,
  calendarOutline,
  giftOutline,
  sparklesOutline,
  checkmarkDoneOutline
} from 'ionicons/icons';

import { ThemeService } from '../../services/theme';
import { AuthService } from '../../services/auth.service';
import { SanityService } from '../../services/sanity.service';
import { UserSession } from '../../shared/models/user.model';

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: 'birthday' | 'tech' | 'official';
  unread: boolean;
  route?: string;
  createdAt?: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    RouterLink,
    RouterLinkActive, 
    IonLabel, 
    IonHeader, 
    IonToolbar, 
    IonIcon, 
    IonTabBar, 
    IonTabButton,
    IonPopover
  ]
})
export class NavbarComponent implements OnInit, OnDestroy {

  private readonly STORAGE_READ_KEY = 'q_ltura_read_notifications';

  private router = inject(Router);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private sanityService = inject(SanityService);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  
  // Suscripción al canal SSE en tiempo real de Sanity
  private sanityLiveSub: Subscription | null = null;

  activeNav: string = 'Inicio';
  isDarkMode: boolean = false;
  isPopoverOpen: boolean = false;
  popoverEvent: MouseEvent | null = null;

  // Bandera para disparar la animación de balanceo en la campana
  hasNewIncomingNotification: boolean = false;

  logoLight = 'assets/Logotipo_/SI_logotipo_color-03.svg';
  logoDark = 'assets/Logotipo_/SI_color blanco-02.svg';

  user: UserSession = {
    id: 'default',
    name: 'Colaborador',
    email: 'colaborador@qualtop.com',
    role: 'Equipo TI',
    department: 'Operaciones',
    company: 'Qualtop',
    avatar: 'https://i.pravatar.cc/150?img=32'
  };

  navItems = [
    { label: 'Inicio', route: '/home' },
    { label: 'Avisos', route: '/avisos' },
    { label: 'Plataformas', route: '/plataformas' },
    { label: 'Denuncia', route: '/denuncia' },
    { label: 'Más', route: '/mas' }
  ];

  mobileTabs = [
    { label: 'Inicio', route: '/home', icon: 'home-outline' },
    { label: 'Avisos', route: '/avisos', icon: 'newspaper-outline' },
    { label: 'Plataformas', route: '/plataformas', icon: 'grid-outline' },
    { label: 'Denuncia', route: '/denuncia', icon: 'shield-checkmark-outline' },
    { label: 'Más', route: '/mas', icon: 'menu-outline' }
  ];

  notificationsList: NotificationItem[] = [];

  constructor() {
    addIcons({ 
      searchOutline, 
      notificationsOutline, 
      notifications,
      notificationsOffOutline,
      homeOutline, 
      newspaperOutline, 
      gridOutline, 
      shieldCheckmarkOutline, 
      menuOutline,
      calendarOutline,
      giftOutline,
      sparklesOutline,
      checkmarkDoneOutline
    });
  }

  ngOnInit(): void {
    this.updateActiveTabByUrl(this.router.url);

    // 1. Sincronización de ruta activa y cierre de popover en navegación
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateActiveTabByUrl(event.urlAfterRedirects || event.url);
        this.isPopoverOpen = false;
        this.cdr.markForCheck();
      });

    // 2. Escuchar cambios de Modo Oscuro
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
        this.cdr.markForCheck();
      });

    // 3. Sincronizar usuario activo y rearmar conexión SSE de Sanity por filial
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activeUser => {
        if (activeUser) {
          this.user = activeUser;
          this.fetchInitialNotifications();
          this.setupRealtimeSanityListener();
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.sanityLiveSub) {
      this.sanityLiveSub.unsubscribe();
    }
  }

  get unreadCount(): number {
    return this.notificationsList.filter(n => n.unread).length;
  }

  /**
   * Carga inicial de notificaciones filtradas estrictamente por empresa
   */
  async fetchInitialNotifications(): Promise<void> {
    try {
      const query = `*[
        _type == "activity" && 
        !(_id in path("drafts.**")) && 
        (lower(company) == lower($company) || company == "Ambas")
      ] | order(_createdAt desc)[0...6] {
        "id": _id,
        title,
        "type": category,
        _createdAt
      }`;

      const raw = await this.sanityService.fetchQuery<any[]>(query, {
        company: this.user.company || 'Qualtop'
      });

      if (raw && raw.length > 0) {
        const readIds: string[] = this.getStoredReadIds();

        this.notificationsList = raw.map(item => ({
          id: item.id,
          title: item.title,
          time: this.formatRelativeTime(item._createdAt),
          type: item.type === 'birthday' ? 'birthday' : item.type === 'tech' ? 'tech' : 'official',
          unread: !readIds.includes(item.id),
          route: '/avisos',
          createdAt: item._createdAt
        }));
      } else {
        this.notificationsList = [];
      }
      this.cdr.markForCheck();
    } catch (e) {
      console.error('Error al sincronizar notificaciones iniciales con Sanity:', e);
    }
  }

  /**
   * Conexión reactiva Server-Sent Events con Sanity
   * Recibe publicaciones en vivo y actualiza la UI sin recargar
   */
  private setupRealtimeSanityListener(): void {
    if (this.sanityLiveSub) {
      this.sanityLiveSub.unsubscribe();
    }

    const query = `*[
      _type == "activity" && 
      !(_id in path("drafts.**")) && 
      (lower(company) == lower($company) || company == "Ambas")
    ]`;

    this.sanityLiveSub = this.sanityService
      .listenQuery(query, { company: this.user.company || 'Qualtop' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (update) => {
          if (update.transition === 'appear' && update.result) {
            const newItem = update.result;

            // Evitar duplicados si el evento ya existe en la lista en memoria
            const alreadyExists = this.notificationsList.some(n => n.id === newItem._id);
            if (alreadyExists) return;

            const notification: NotificationItem = {
              id: newItem._id,
              title: newItem.title || 'Nueva actividad publicada',
              time: 'Justo ahora',
              type: newItem.category === 'birthday' ? 'birthday' : newItem.category === 'tech' ? 'tech' : 'official',
              unread: true,
              route: '/avisos',
              createdAt: newItem._createdAt
            };

            // Inyectar en el primer puesto de la lista
            this.notificationsList = [notification, ...this.notificationsList];

            // Sacudida visual de la campana
            this.triggerBellAnimation();

            // Notificación discreta superior
            this.presentToast(`Nuevo aviso: ${notification.title}`);

            this.cdr.markForCheck();
          }
        },
        error: (err) => console.error('Error en listener SSE de Sanity:', err)
      });
  }

  private triggerBellAnimation(): void {
    this.hasNewIncomingNotification = true;
    setTimeout(() => {
      this.hasNewIncomingNotification = false;
      this.cdr.markForCheck();
    }, 1500);
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3500,
      position: 'top',
      mode: 'ios',
      buttons: [
        {
          text: 'Ver',
          handler: () => {
            this.router.navigateByUrl('/avisos');
          }
        }
      ]
    });
    await toast.present();
  }

  public openPopover(event: MouseEvent): void {
    this.popoverEvent = event;
    this.isPopoverOpen = true;
    this.cdr.markForCheck();
  }

  public onPopoverDismiss(): void {
    this.isPopoverOpen = false;
    this.markAllAsRead();
  }

  public onNotificationClick(item: NotificationItem): void {
    item.unread = false;
    this.saveReadId(item.id);
    this.isPopoverOpen = false;
    this.cdr.markForCheck();

    if (item.route) {
      this.router.navigateByUrl(item.route);
    }
  }

  public markAllAsRead(): void {
    const readIds = this.getStoredReadIds();

    this.notificationsList.forEach(item => {
      item.unread = false;
      if (!readIds.includes(item.id)) {
        readIds.push(item.id);
      }
    });

    localStorage.setItem(this.STORAGE_READ_KEY, JSON.stringify(readIds));
    this.cdr.markForCheck();
  }

  private getStoredReadIds(): string[] {
    try {
      const data = localStorage.getItem(this.STORAGE_READ_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveReadId(id: string): void {
    const list = this.getStoredReadIds();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(this.STORAGE_READ_KEY, JSON.stringify(list));
    }
  }

  /**
   * Convierte la fecha ISO de Sanity en formato amigable
   */
  private formatRelativeTime(dateString?: string): string {
    if (!dateString) return 'Reciente';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Justo ahora';
    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} d`;

    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  }

  private updateActiveTabByUrl(url: string): void {
    const currentTab = this.mobileTabs.find(tab => url.startsWith(tab.route));
    if (currentTab) {
      this.activeNav = currentTab.label;
    } else if (url === '/' || url.includes('/home')) {
      this.activeNav = 'Inicio';
    }
  }
}