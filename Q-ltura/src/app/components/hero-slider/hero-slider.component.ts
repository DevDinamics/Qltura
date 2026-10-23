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
  sparklesOutline, 
  personCircleOutline 
} from 'ionicons/icons';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { SanityService } from '../../services/sanity.service';

export interface Slide {
  id: string | number;
  tag: string;
  title: string;
  highlightText?: string;
  description: string;
  buttonText: string;
  buttonUrl?: string;
  badgeCompany?: 'Qualtop' | 'SYE' | 'Ambas';
  imageSrc: string;
  imageAlt?: string;
  accentTheme?: 'orange' | 'purple' | 'blue';
  order?: number;
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
  private sanityService = inject(SanityService);
  private destroy$ = new Subject<void>();
  private sanityLiveSub: Subscription | null = null;

  public currentIndex = 0;
  public currentCompany: string = 'qualtop';
  public slides: Slide[] = [];

  private autoPlayInterval: ReturnType<typeof setInterval> | null = null;
  private touchStartX = 0;
  private touchEndX = 0;

  // Fallback estatico en caso de fallo de red
  private readonly fallbackSlides: Slide[] = [
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
      arrowForwardOutline,
      personCircleOutline,
      chevronForwardOutline,
      sparklesOutline
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        const companyName = user?.company || 'Qualtop';
        this.currentCompany = companyName.toLowerCase();
        
        this.loadSlidesFromSanity(companyName);
        this.setupRealtimeListener(companyName);
      });
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    if (this.sanityLiveSub) {
      this.sanityLiveSub.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentSlide(): Slide {
    return this.slides[this.currentIndex] || this.fallbackSlides[0];
  }

  // Carga de slides desde Sanity
  private async loadSlidesFromSanity(company: string): Promise<void> {
    try {
      const query = `*[
        _type == "slide" && 
        !(_id in path("drafts.**")) && 
        (company == $company || company == "Ambas")
      ] | order(order asc) {
        "id": _id,
        title,
        highlightText,
        "badgeCompany": company,
        tag,
        description,
        buttonText,
        buttonUrl,
        accentTheme,
        "imageSrc": image.asset->url,
        order
      }`;

      const data = await this.sanityService.fetchQuery<Slide[]>(query, { company });

      if (data && data.length > 0) {
        this.slides = data;
      } else {
        this.applyFallback(company);
      }
    } catch {
      this.applyFallback(company);
    } finally {
      this.currentIndex = 0;
      this.cdr.markForCheck();
      this.resetAutoPlay();
    }
  }

  // Suscripcion en tiempo real a cambios en Sanity
  private setupRealtimeListener(company: string): void {
    if (this.sanityLiveSub) {
      this.sanityLiveSub.unsubscribe();
    }

    const query = `*[
      _type == "slide" && 
      !(_id in path("drafts.**")) && 
      (company == $company || company == "Ambas")
    ]`;

    this.sanityLiveSub = this.sanityService
      .listenQuery(query, { company })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadSlidesFromSanity(company);
        }
      });
  }

  // Filtrado de respaldo
  private applyFallback(company: string): void {
    this.slides = this.fallbackSlides.filter(
      s => !s.badgeCompany || s.badgeCompany === 'Ambas' || s.badgeCompany.toLowerCase() === company.toLowerCase()
    );
  }

  // Controles de navegacion
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

  // Gestos tactiles
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

  // Reproduccion automatica
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
      this.autoPlayInterval = null;
    }
  }

  private resetAutoPlay(): void {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}