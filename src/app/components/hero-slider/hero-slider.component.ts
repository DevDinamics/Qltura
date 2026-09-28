import { 
  Component, 
  OnInit, 
  OnDestroy, 
  ChangeDetectionStrategy, 
  ChangeDetectorRef, 
  NgZone 
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
  public currentIndex = 0;
  private autoPlayInterval: any;

  // Variables para la detección del Swipe táctil en móvil
  private touchStartX = 0;
  private touchEndX = 0;

  public slides: Slide[] = [
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

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    addIcons({
      chevronBackOutline,
      chevronForwardOutline,
      arrowForwardOutline,
      sparklesOutline
    });
  }

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  get currentSlide(): Slide {
    return this.slides[this.currentIndex];
  }

  // Desplazamiento base sin disparar reinicios infinitos de timer
  private changeSlide(delta: number): void {
    this.currentIndex = (this.currentIndex + delta + this.slides.length) % this.slides.length;
    this.cdr.markForCheck();
  }

  // Métodos invocados por interacción del usuario (resetean el temporizador)
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

  /* --- MANEJO DE GESTOS TOUCH/SWIPE MÓVIL --- */
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

  /* --- CONTROL DEL TEMPORIZADOR AUTOMÁTICO --- */
  private startAutoPlay(): void {
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