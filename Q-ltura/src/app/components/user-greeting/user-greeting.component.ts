import { 
  Component, 
  OnInit, 
  OnDestroy, 
  Input, 
  inject, 
  ChangeDetectorRef 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  newspaperOutline, 
  personCircleOutline,
  partlySunnyOutline, // Amanecer/Atardecer
  sunnyOutline,       // Día
  moonOutline         // Noche
} from 'ionicons/icons';

import { AuthService } from '../../services/auth.service';
import { CompanyType } from '../../shared/models/user.model';

@Component({
  selector: 'app-user-greeting',
  templateUrl: './user-greeting.component.html',
  styleUrls: ['./user-greeting.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class UserGreetingComponent implements OnInit, OnDestroy {

  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Input() userName: string = 'Colaborador';
  @Input() company: CompanyType = 'Qualtop';

  formattedDate: string = '';
  greetingPrefix: string = 'Hola';
  timePeriod: 'morning' | 'afternoon' | 'night' = 'morning';

  constructor() {
    addIcons({
      newspaperOutline,
      personCircleOutline,
      partlySunnyOutline,
      sunnyOutline,
      moonOutline
    });
  }

  ngOnInit(): void {
    this.setFormattedDate();
    this.setGreetingByTime();

    // Sincronización en tiempo real con la sesión activa
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user) {
          this.userName = user.name.split(' ')[0]; 
          this.company = user.company;
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setFormattedDate(): void {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    };
    this.formattedDate = today.toLocaleDateString('es-ES', options).toUpperCase();
  }

  private setGreetingByTime(): void {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 12) {
      this.greetingPrefix = 'Buenos días';
      this.timePeriod = 'morning';
    } else if (hour >= 12 && hour < 19) {
      this.greetingPrefix = 'Buen día'; // "Buen día" como pediste para el transcurso de la tarde
      this.timePeriod = 'afternoon';
    } else {
      this.greetingPrefix = 'Buenas noches';
      this.timePeriod = 'night';
    }
  }

  /**
   * CTA 1: Desplaza la vista suavemente hacia el feed de noticias
   */
  public scrollToFeed(): void {
    const feedElement = document.querySelector('app-feed-dinamico') || document.querySelector('.feed-card');
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * CTA 2: Conduce al perfil/dashboard del colaborador
   */
  public goToMiEspacio(): void {
    this.router.navigate(['/mas']);
  }
}