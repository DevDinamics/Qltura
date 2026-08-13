import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private darkModeSubject = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.darkModeSubject.asObservable();

  initTheme() {
    const savedTheme = localStorage.getItem('app-theme');
    let isDark = false;

    if (savedTheme) {
      isDark = savedTheme === 'dark';
    } else {
      // Detección automática según el SO del usuario (Mac/iOS/Windows)
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.setDarkMode(isDark);
  }

  setDarkMode(isDark: boolean) {
    this.darkModeSubject.next(isDark);
    localStorage.setItem('app-theme', isDark ? 'dark' : 'light');

    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }

  get isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
}