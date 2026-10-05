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
  ToastController,
  PopoverController,
  AlertController // 👈 1. Importar AlertController
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
  checkmarkDoneOutline,
  chevronDownOutline,
  personCircleOutline,
  logOutOutline,
  heartOutline,
  ribbonOutline
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
  private popoverCtrl = inject(PopoverController);
  private alertCtrl = inject(AlertController); // 👈 2. Inyectar AlertController
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  
  private sanityLiveSub: Subscription | null = null;

  activeNav: string = 'Comunidad & Noticias';
  isDarkMode: boolean = false;

  // Popover Notificaciones
  isPopoverOpen: boolean = false;
  popoverEvent: MouseEvent | null = null;

  // Popover Menú de Usuario
  isUserPopoverOpen: boolean = false;
  userPopoverEvent: MouseEvent | null = null;

  hasNewIncomingNotification: boolean = false;

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
    { label: 'Comunidad & Noticias', route: '/avisos' },
    { label: 'Beneficios & Wellness', route: '/beneficios' },
    { label: 'Reconocimientos', route: '/reconocimientos' }
  ];

  mobileTabs = [
    { label: 'Comunidad', route: '/avisos', icon: 'newspaper-outline' },
    { label: 'Beneficios', route: '/beneficios', icon: 'heart-outline' },
    { label: 'Reconocimientos', route: '/reconocimientos', icon: 'ribbon-outline' },
    { label: 'Denuncia', route: '/denuncia', icon: 'shield-checkmark-outline' },
    { label: 'Mi Espacio', route: '/mas', icon: 'person-circle-outline' }
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
      checkmarkDoneOutline,
      chevronDownOutline,
      personCircleOutline,
      logOutOutline,
      heartOutline,
      ribbonOutline
    });
  }

  ngOnInit(): void {
    this.updateActiveTabByUrl(this.router.url);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateActiveTabByUrl(event.urlAfterRedirects || event.url);
        this.isPopoverOpen = false;
        this.isUserPopoverOpen = false;
        this.cdr.markForCheck();
      });

    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
        this.cdr.markForCheck();
      });

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

            this.notificationsList = [notification, ...this.notificationsList];
            this.triggerBellAnimation();
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

  public openSearch(): void {
    this.router.navigateByUrl('/plataformas');
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

  public openUserPopover(event: MouseEvent): void {
    this.userPopoverEvent = event;
    this.isUserPopoverOpen = true;
    this.cdr.markForCheck();
  }

  public async navigateTo(route: string): Promise<void> {
    this.isUserPopoverOpen = false;
    try {
      const top = await this.popoverCtrl.getTop();
      if (top) await top.dismiss();
    } catch {}
    this.router.navigateByUrl(route);
  }

  // 👈 3. ALERTA MODAL NATIVA DE CONFIRMACIÓN (IDÉNTICA A LA CAPTURA)
  public async confirmLogout(): Promise<void> {
    // Primero cerramos el popover para evitar solapamientos en pantalla
    this.isUserPopoverOpen = false;
    this.cdr.markForCheck();

    try {
      const topPopover = await this.popoverCtrl.getTop();
      if (topPopover) {
        await topPopover.dismiss();
      }
    } catch (e) {
      console.warn('No se encontró popover activo previo a la alerta:', e);
    }

    // Modal de confirmación estilo iOS
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas salir del portal Q-ltura?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          handler: async () => {
            await this.performLogout();
          }
        }
      ]
    });

    await alert.present();
  }

  // 👈 4. EJECUCIÓN DEL LOGOUT TRAS CONFIRMAR
  private async performLogout(): Promise<void> {
    try {
      if (this.authService && typeof this.authService.logout === 'function') {
        await this.authService.logout();
      }
    } catch (error) {
      console.error('Error en authService.logout:', error);
    } finally {
      await this.router.navigate(['/login'], { replaceUrl: true });
      this.cdr.markForCheck();
    }
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
    if (url.includes('/avisos')) {
      this.activeNav = 'Comunidad & Noticias';
    } else {
      const currentTab = this.mobileTabs.find(tab => url.startsWith(tab.route));
      if (currentTab) {
        this.activeNav = currentTab.label;
      } else if (url === '/' || url.includes('/home')) {
        this.activeNav = 'Inicio';
      }
    }
  }
}