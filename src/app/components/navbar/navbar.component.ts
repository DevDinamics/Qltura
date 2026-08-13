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
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { 
  IonHeader, 
  IonToolbar, 
  IonIcon, 
  IonTabBar, 
  IonTabButton, 
  IonLabel,
  IonPopover 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  searchOutline, 
  notificationsOutline, 
  notifications,
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
import { UserSession } from '../../shared/models/user.model';

export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  type: 'birthday' | 'tech' | 'official';
  unread: boolean;
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

  private router = inject(Router);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  activeNav: string = 'Inicio';
  isDarkMode: boolean = false;

  // Control programático del Popover de notificaciones
  isPopoverOpen: boolean = false;
  popoverEvent: MouseEvent | null = null;

  // Logotipos corporativos
  logoLight = 'assets/Logotipo_/SI_logotipo_color-03.svg';
  logoDark = 'assets/Logotipo_/SI_color blanco-02.svg';

  // 👤 Objeto de usuario activo (Sincronizado con AuthService)
  user: UserSession = {
    id: 'default',
    name: 'Ana López',
    email: 'ana.lopez@qualtop.com',
    role: 'Consultora Sr.',
    department: 'TI',
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

  notificationsList: NotificationItem[] = [
    {
      id: 'notif-1',
      title: '¡Martes de cumpleañeros de Julio! Nos vemos a las 10:30 AM.',
      time: 'Hace 15 min',
      type: 'birthday',
      unread: true
    },
    {
      id: 'notif-2',
      title: 'Ventana de Mantenimiento programada para servidores SGI.',
      time: 'Hace 2 horas',
      type: 'tech',
      unread: true
    },
    {
      id: 'notif-3',
      title: 'Town Hall Q-ltura: Revisa los resultados del Q3.',
      time: 'Ayer',
      type: 'official',
      unread: false
    }
  ];

  constructor() {
    addIcons({ 
      searchOutline, 
      notificationsOutline, 
      notifications,
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

    // 1. Escuchar eventos de navegación
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

    // 3. ⚡ SINCRONIZACIÓN EN TIEMPO REAL CON CARLOS Y ANA
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activeUser => {
        if (activeUser) {
          this.user = activeUser;
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get unreadCount(): number {
    return this.notificationsList.filter(n => n.unread).length;
  }

  public openPopover(event: MouseEvent): void {
    this.popoverEvent = event;
    this.isPopoverOpen = true;
    this.cdr.markForCheck();
  }

  public markAllAsRead(): void {
    this.notificationsList.forEach(n => n.unread = false);
    this.cdr.markForCheck();
  }

  private updateActiveTabByUrl(url: string): void {
    const currentTab = this.mobileTabs.find(tab => url.startsWith(tab.route));
    if (currentTab) {
      this.activeNav = currentTab.label;
    } else if (url === '/' || url.includes('/home')) {
      this.activeNav = 'Inicio';
    }
  }

  public navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }
}