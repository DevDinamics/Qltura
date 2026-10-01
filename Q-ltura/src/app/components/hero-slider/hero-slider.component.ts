import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  NgZone,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  chevronBackOutline, 
  chevronForwardOutline, 
  arrowForwardOutline, 
  sparklesOutline 
} from 'ionicons/icons';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service'; // Asegúrate de tener la ruta correcta

export interface Slide {
  id: number;
  tag: string;
  title: string;
  highlightText?: string;
  description: string;
  buttonText: string;
  buttonUrl?: string;
  badgeCompany?: 'Qualtop' | 'SYE' | 'Q-ltura';
  imageSrc: string;
  imageAlt?: string;
  accentTheme?: 'orange' | 'purple' | 'blue';
}

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterLink, IonIcon],
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroSliderComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  public currentIndex = 0;
  public currentCompany: string = 'qualtop'; // Clase CSS por defecto
  public slides: Slide[] = []; // Slides filtrados que se mostrarán

  private autoPlayInterval: any;
  private touchStartX = 0;
  private touchEndX = 0;

  // Tu base de datos estática
  private allSlides: Slide[] = [
    {
      id: 1,
      tag: 'CULTURA Y EVENTOS',
      title: 'Data Community',
      highlightText: 'Meetup 2026',
      description: 'Conectamos ideas, compartimos conocimiento y construimos el futuro de la ingeniería juntos.',
      buttonText: 'Confirmar asistencia',
      buttonUrl: '/avisos',
      badgeCompany: 'Qualtop',
      accentTheme: 'orange',
      imageSrc: 'assets/Diagrmas-SI/Imagen4.png',
      imageAlt: 'Data Community Event'
    },
    {
      id: 2,
      tag: 'CAPACITACIÓN TI',
      title: 'Arquitectura & Cloud',
      highlightText: 'Sistemas Escalables',
      description: 'Aprende las mejores prácticas para diseñar microservicios y sistemas distribuidos de alto impacto.',
      buttonText: 'Explorar programa',
      buttonUrl: '/plataformas',
      badgeCompany: 'SYE',
      accentTheme: 'purple',
      imageSrc: 'assets/Diagrmas-SI/Imagen1.png',
      imageAlt: 'Cloud Systems Architecture'
    }
  ];

  constructor() {
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
      arrowForwardOutline,
      sparklesOutline
    });
  }

  ngOnInit(): void {
    // Escuchar qué usuario inició sesión
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user && user.company) {
          // Guardamos 'qualtop' o 'sye' en minúsculas para inyectarlo como clase CSS
          this.currentCompany = user.company.toLowerCase(); 
          
          // Filtramos el arreglo estático para que solo vea los de su empresa (o los globales si tuvieras)
          this.slides = this.allSlides.filter(
            slide => slide.badgeCompany?.toLowerCase() === this.currentCompany
          );
        } else {
          this.slides = this.allSlides; // Fallback
        }
        
        this.currentIndex = 0;
        this.cdr.markForCheck();
        this.resetAutoPlay();
      });
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentSlide(): Slide {
    return this.slides[this.currentIndex];
  }

  private changeSlide(delta: number): void {
    if (this.slides.length <= 1) return;
    this.currentIndex = (this.currentIndex + delta + this.slides.length) % this.slides.length;
    this.cdr.markForCheck();
  }

  public nextSlide(): void {
    this.changeSlide(1);
    this.resetAutoPlay();
  }

  public prevSlide(): void {
    this.changeSlide(-1);
    this.resetAutoPlay();
  }

  public goToSlide(index: number): void {
    this.currentIndex = index;
    this.cdr.markForCheck();
    this.resetAutoPlay();
  }

  public onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  public onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeThreshold = 50;
    if (this.touchStartX - this.touchEndX > swipeThreshold) {
      this.nextSlide();
    } else if (this.touchEndX - this.touchStartX > swipeThreshold) {
      this.prevSlide();
    }
  }

  private startAutoPlay(): void {
    this.stopAutoPlay();
    if (this.slides.length <= 1) return;

    this.ngZone.runOutsideAngular(() => {
      this.autoPlayInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.changeSlide(1);
        });
      }, 7000);
    });
  }

  private stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  private resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}