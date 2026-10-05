import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  heartOutline, 
  fitnessOutline, 
  schoolOutline, 
  cafeOutline, 
  shieldCheckmarkOutline,
  sparklesOutline,
  desktopOutline,
  giftOutline,
  medkitOutline,
  walletOutline,
  timeOutline,
  airplaneOutline
} from 'ionicons/icons';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';

export interface BenefitCard {
  icon: string;
  category: string;
  title: string;
  description: string;
  tag: string;
  company: 'Qualtop' | 'SYE' | 'Ambas';
}

@Component({
  selector: 'app-beneficios',
  templateUrl: './beneficios.page.html',
  styleUrls: ['./beneficios.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonContent, IonIcon, NavbarComponent, FooterComponent]
})
export class BeneficiosPage implements OnInit, OnDestroy {
  
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  currentCompany: string = 'Qualtop';

  // Catálogo completo categorizado por empresa
  allBenefits: BenefitCard[] = [
    // --- BENEFICIOS EXCLUSIVOS QUALTOP ---
    {
      icon: 'medkit-outline',
      category: 'Salud & Gastos Médicos',
      title: 'Seguro Médico Colectivo Qualtop',
      description: 'Póliza de gastos médicos mayores y red hospitalaria preferencial para consultores Qualtop.',
      tag: 'Salud',
      company: 'Qualtop'
    },
    {
      icon: 'fitness-outline',
      category: 'Wellness & Deporte',
      title: 'Convenio Smart Fit & Clubes',
      description: 'Tarifas corporativas y membresías sin costo de inscripción en cadenas asociadas.',
      tag: 'Fitness',
      company: 'Qualtop'
    },
    {
      icon: 'wallet-outline',
      category: 'Finanzas Personales',
      title: 'Caja de Ahorro & Rendimientos',
      description: 'Plan de ahorro voluntario con aportaciones quincenales y tasa de rendimiento protegida.',
      tag: 'Financiero',
      company: 'Qualtop'
    },
    {
      icon: 'airplane-outline',
      category: 'Tiempo Libre',
      title: 'Días Flexibles por Antigüedad',
      description: 'Días adicionales de descanso escalonados según tus años de trayectoria en Qualtop.',
      tag: 'Flexibilidad',
      company: 'Qualtop'
    },

    // --- BENEFICIOS EXCLUSIVOS SYE (SOFTWARE INNOVATORS) ---
    {
      icon: 'desktop-outline',
      category: 'Equipamiento & Remoto',
      title: 'Bono Home Office & Periféricos',
      description: 'Apoyo para gastos de conectividad, silla ergonómica y hardware de desarrollo en casa.',
      tag: 'Remoto',
      company: 'SYE'
    },
    {
      icon: 'school-outline',
      category: 'Tech Stack & Certificaciones',
      title: 'Voucher para Certificaciones Cloud',
      description: 'Reembolso total de exámenes de certificación en AWS, Azure, GCP y arquitecturas de software.',
      tag: 'Educación',
      company: 'SYE'
    },
    {
      icon: 'timeOutline',
      category: 'Cultura Laboral',
      title: 'Viernes Corto (Short Fridays)',
      description: 'Jornada reducida los viernes para proyectos que cumplan sus sprints y entregables a tiempo.',
      tag: 'Wellness',
      company: 'SYE'
    },
    {
      icon: 'giftOutline',
      category: 'Reconocimiento Tech',
      title: 'Hackathons & Innovation Pool',
      description: 'Premios en tecnología, gadgets y bonos por iniciativas innovadoras dentro de los proyectos de SYE.',
      tag: 'Innovación',
      company: 'SYE'
    },

    // --- BENEFICIOS COMPARTIDOS (AMBAS EMPRESAS) ---
    {
      icon: 'cafeOutline',
      category: 'Balance de Vida',
      title: 'Día Libre por Cumpleaños',
      description: 'Disfruta tu día de cumpleaños completamente libre para festejar con tu familia y amigos.',
      tag: 'Bienestar',
      company: 'Ambas'
    },
    {
      icon: 'heart-outline',
      category: 'Asistencia Integral',
      title: 'Línea de Apoyo Psicológico & Nutrición',
      description: 'Consultas 24/7 sin costo para orientación emocional, médica y planes nutricionales.',
      tag: 'Wellness',
      company: 'Ambas'
    }
  ];

  constructor() {
    addIcons({
      heartOutline,
      fitnessOutline,
      schoolOutline,
      cafeOutline,
      shieldCheckmarkOutline,
      sparklesOutline,
      desktopOutline,
      giftOutline,
      medkitOutline,
      walletOutline,
      timeOutline,
      airplaneOutline
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user && user.company) {
          this.currentCompany = user.company;
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Filtra los beneficios de la empresa en sesión + los globales compartidos
  get currentBenefits(): BenefitCard[] {
    const userCompany = (this.currentCompany || 'Qualtop').toLowerCase();
    return this.allBenefits.filter(item => 
      item.company === 'Ambas' || item.company.toLowerCase() === userCompany
    );
  }
}