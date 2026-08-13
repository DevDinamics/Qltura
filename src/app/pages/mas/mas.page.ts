import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, IonModal, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ThemeService } from '../../services/theme';
import { AuthService } from '../../services/auth.service';
import { UserSession } from '../../shared/models/user.model';
import { addIcons } from 'ionicons';
import { 
  personOutline, 
  notificationsOutline, 
  moon, 
  sunnyOutline,
  helpCircleOutline, 
  headsetOutline, 
  shieldCheckmarkOutline, 
  logOutOutline, 
  chevronForwardOutline,
  businessOutline,
  lockClosedOutline
} from 'ionicons/icons';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  colorClass: 'purple' | 'orange' | 'blue' | 'green' | 'red' | 'dark';
  badge?: string;
  isBeta?: boolean;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-mas',
  templateUrl: './mas.page.html',
  styleUrls: ['./mas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NavbarComponent
  ]
})
export class MasPage implements OnInit, OnDestroy {

  @ViewChild('profileModal') profileModal!: IonModal;
  @ViewChild('notificationsModal') notificationsModal!: IonModal;

  private destroy$ = new Subject<void>();
  private alertController = inject(AlertController);
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  isDarkMode: boolean = false;
  desktopNotificationsEnabled: boolean = false;

  // 👤 Usuario activo cargado reactivamente desde el AuthService
  user: UserSession = {
    id: 'default',
    name: 'Ana López',
    email: 'ana.lopez@qualtop.com',
    role: 'Consultora Sr. de Software',
    department: 'Desarrollo & TI',
    company: 'Qualtop',
    avatar: 'https://i.pravatar.cc/150?img=32'
  };

  editUser: UserSession = { ...this.user };

  notificationPreferences = {
    official: true,
    events: true,
    emailDigest: false
  };

  accountItems: MenuItem[] = [
    { id: 'perfil', label: 'Mi Perfil y Cuenta', icon: 'person-outline', colorClass: 'purple' },
    { id: 'notificaciones', label: 'Notificaciones y alertas', icon: 'notifications-outline', colorClass: 'orange' }
  ];

  menuGroups: MenuGroup[] = [
    {
      title: 'SOPORTE Y AYUDA',
      items: [
        { id: 'soporte', label: 'Mesa de ayuda TI / Soporte', icon: 'headset-outline', colorClass: 'blue', isBeta: true },
        { id: 'faq', label: 'Preguntas frecuentes', icon: 'help-circle-outline', colorClass: 'green', isBeta: true }
      ]
    },
    {
      title: 'ORGANIZACIÓN Y LEGAL',
      items: [
        { id: 'empresa', label: 'Acerca de Q-ltura / Empresa', icon: 'business-outline', colorClass: 'purple' },
        { id: 'privacidad', label: 'Políticas de privacidad y datos', icon: 'lock-closed-outline', colorClass: 'blue' }
      ]
    }
  ];

  constructor() {
    addIcons({
      personOutline,
      notificationsOutline,
      moon,
      sunnyOutline,
      helpCircleOutline,
      headsetOutline,
      shieldCheckmarkOutline,
      logOutOutline,
      chevronForwardOutline,
      businessOutline,
      lockClosedOutline
    });
  }

  ngOnInit(): void {
    // 1. Escuchar cambios de Modo Oscuro
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
        this.cdr.markForCheck();
      });

    // 2. CONEXIÓN DIRECTA CON CARLOS Y ANA: Escuchar la sesión activa del AuthService
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(activeUser => {
        if (activeUser) {
          this.user = activeUser;
          this.editUser = { ...activeUser };
          this.cdr.markForCheck();
        }
      });

    // 3. Permisos de notificaciones del navegador
    if ('Notification' in window) {
      this.desktopNotificationsEnabled = Notification.permission === 'granted';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async canDismiss(data?: undefined, role?: string) {
    return role !== 'gesture';
  }

  openAccountModal(id: string) {
    if (id === 'perfil') {
      this.editUser = { ...this.user };
      this.profileModal.present();
    } else if (id === 'notificaciones') {
      this.notificationsModal.present();
    }
  }

  onThemeToggleChange(event: any) {
    const isChecked = event.detail.checked;
    this.themeService.setDarkMode(isChecked);
  }

  async toggleDesktopNotifications(event: any) {
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (!('Notification' in window)) {
        await this.mostrarAlerta('No compatible', 'Este navegador no soporta notificaciones de escritorio.');
        this.desktopNotificationsEnabled = false;
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.desktopNotificationsEnabled = true;
        new Notification('¡Notificaciones activadas!', {
          body: `Hola ${this.user.name}, recibirás avisos importantes en tu pantalla.`,
          icon: this.user.avatar
        });
      } else {
        this.desktopNotificationsEnabled = false;
        await this.mostrarAlerta(
          'Permiso denegado',
          'Debes permitir las notificaciones en la configuración de tu navegador.'
        );
      }
    } else {
      this.desktopNotificationsEnabled = false;
    }
  }

  saveProfile(modal: IonModal) {
    this.user.name = this.editUser.name;
    modal.dismiss();
  }

  async onItemClick(item: MenuItem) {
    if (item.isBeta) {
      await this.mostrarPropuestaBeta(item.label);
    }
  }

  async logout(): Promise<void> {
    const alert = await this.alertController.create({
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
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/login'], { replaceUrl: true });
          }
        }
      ]
    });

    await alert.present();
  }

  private async mostrarAlerta(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      mode: 'ios',
      buttons: ['Entendido']
    });
    await alert.present();
  }

  private async mostrarPropuestaBeta(tituloSeccion: string) {
    const alert = await this.alertController.create({
      header: 'Módulo en desarrollo',
      subHeader: `${tituloSeccion} • Módulo Beta`,
      message: `Estamos diseñando un canal centralizado para gestionar requerimientos de TI y agilizar la atención entre equipos.`,
      mode: 'ios',
      buttons: [{ text: 'Entendido', role: 'cancel' }]
    });
    await alert.present();
  }
}