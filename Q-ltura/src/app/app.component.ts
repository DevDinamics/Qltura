import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ThemeService } from './services/theme';
import { AuthService } from './services/auth.service';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [CommonModule, IonApp, IonRouterOutlet, NavbarComponent],
})
export class AppComponent implements OnInit {
  showNavbar: boolean = true;

  private themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.themeService.initTheme();
    this.initNavbarVisibility();
    this.initCompanyThemeSync();
  }

  // 1. Visibilidad del Navbar según la ruta
  private initNavbarVisibility(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects || event.url;
        this.showNavbar = !url.includes('/login');
      });
  }

  // 2. Sincronización del tema corporativo (Qualtop / SYE) en el <body>
  private initCompanyThemeSync(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        const body = document.body;

        // Limpia clases anteriores
        body.classList.remove('qualtop', 'sye');

        if (user && user.company) {
          // Inyecta 'qualtop' o 'sye' según la empresa del usuario
          body.classList.add(user.company.toLowerCase());
        }
      });
  }
}