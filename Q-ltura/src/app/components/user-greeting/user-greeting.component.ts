import { Component, OnInit, OnDestroy, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CompanyType } from '../../shared/models/user.model';
import { IonIcon } from "@ionic/angular/standalone";

@Component({
  selector: 'app-user-greeting',
  templateUrl: './user-greeting.component.html',
  styleUrls: ['./user-greeting.component.scss'],
  standalone: true,
  imports: [IonIcon, CommonModule]
})
export class UserGreetingComponent implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  @Input() userName: string = 'Colaborador';
  @Input() company: CompanyType = 'Qualtop';

  formattedDate: string = '';
  greetingPrefix: string = 'Hola';
  motivationalQuote: string = '';
  
  // Variable para controlar la animación del widget derecho
  timePeriod: 'morning' | 'afternoon' | 'night' = 'morning';

  private quotes: string[] = [
    'Construyamos cosas increíbles juntos hoy.',
    'Cada día es una nueva oportunidad para innovar.',
    'El éxito es la suma de pequeños esfuerzos repetidos día tras día.',
    'La mejor forma de predecir el futuro es creándolo.',
    'Haz de hoy un día extraordinario para tu equipo.',
    'La excelencia no es un acto, es un hábito.',
    'Tu talento y dedicación hacen la diferencia hoy.'
  ];

  ngOnInit(): void {
    this.setFormattedDate();
    this.setGreetingByTime();
    this.setDailyQuote();

    // Sincronización en tiempo real
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
    
    if (hour >= 6 && hour < 12) {
      this.greetingPrefix = 'Buenos días';
      this.timePeriod = 'morning';
    } else if (hour >= 12 && hour < 20) {
      this.greetingPrefix = 'Buenas tardes';
      this.timePeriod = 'afternoon';
    } else {
      this.greetingPrefix = 'Buenas noches';
      this.timePeriod = 'night';
    }
  }

  private setDailyQuote(): void {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
    );
    const quoteIndex = dayOfYear % this.quotes.length;
    this.motivationalQuote = this.quotes[quoteIndex];
  }
}