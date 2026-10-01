import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type CompanyType = 'Qualtop' | 'SYE';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  company: CompanyType;
  avatar: string;
  token?: string;
}

// Alias para mantener compatibilidad con login.page.ts
export type AppUser = UserSession;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'user_session';

  private currentUserSubject = new BehaviorSubject<UserSession | null>(null);
  public currentUser$: Observable<UserSession | null> = this.currentUserSubject.asObservable();

  // 👥 USUARIOS DE MUESTRA PRECONFIGURADOS PARA LA DEMO
  public readonly demoUsers: UserSession[] = [
    {
      id: 'demo-qualtop-01',
      name: 'Ana López',
      email: 'ana.lopez@qualtop.com',
      role: 'Consultora Sr. de Software',
      department: 'Desarrollo & TI',
      company: 'Qualtop',
      avatar: 'https://i.pravatar.cc/150?img=32'
    },
    {
      id: 'demo-sye-02',
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@sye.com',
      role: 'Líder de Infraestructura',
      department: 'Operaciones & Sistemas',
      company: 'SYE',
      avatar: 'https://i.pravatar.cc/150?img=11'
    }
  ];

  constructor() {
    this.loadInitialSession();
  }

  /**
   * Carga la sesión guardada desde localStorage al iniciar la app
   */
  private loadInitialSession(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const session: UserSession = JSON.parse(saved);
        this.currentUserSubject.next(session);
        this.applyThemeToDom(session.company);
      }
    } catch (error) {
      console.error('Error al parsear la sesión activa:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Retorna el valor actual síncrono del usuario autenticado
   */
  public get currentUserValue(): UserSession | null {
    return this.currentUserSubject.value;
  }

  /**
   * Inicia sesión seleccionando una cuenta de prueba rápida.
   * Acepta tanto el ID ('demo-qualtop-01') como alias simples ('ana', 'carlos').
   */
  public loginAsDemo(key: string): UserSession {
    const search = key.toLowerCase();
    const user = this.demoUsers.find(u => 
      u.id === key || 
      (search.includes('ana') && u.company === 'Qualtop') ||
      (search.includes('carlos') && u.company === 'SYE')
    ) || this.demoUsers[0];

    this.saveSession(user);
    return user;
  }

  /**
   * Inicia sesión con correo y empresa seleccionados manualmente.
   */
  public login(email: string, company: CompanyType): UserSession {
    const existingDemo = this.demoUsers.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existingDemo) {
      this.saveSession(existingDemo);
      return existingDemo;
    }

    const cleanEmail = email.trim();
    const nameFromEmail = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    const customUser: UserSession = {
      id: 'usr-' + Date.now(),
      name: formattedName || 'Colaborador',
      email: cleanEmail,
      role: 'Colaborador General',
      department: 'Operaciones',
      company: company,
      avatar: 'https://i.pravatar.cc/150?img=68'
    };

    this.saveSession(customUser);
    return customUser;
  }

  /**
   * Alias de login() requerido por login.page.ts
   */
  public loginWithEmail(email: string, company: CompanyType = 'Qualtop'): UserSession {
    return this.login(email, company);
  }

  /**
   * Conector asíncrono preparado para Google Cloud Platform / Firebase Auth
   */
  public async loginWithGoogleWorkspace(googleCredential?: any): Promise<UserSession> {
    // Al conectar GCP, aquí se procesará el token OAuth de Google Workspace
    const mockEmail = 'diego.delgado@qualtop.com';
    return this.login(mockEmail, 'Qualtop');
  }

  /**
   * Guarda la sesión, aplica la colorimetría en <body> y notifica suscriptores
   */
  private saveSession(session: UserSession): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    this.applyThemeToDom(session.company);
    this.currentUserSubject.next(session);
  }

  /**
   * Inyecta la clase corporativa al body (.qualtop o .sye)
   */
  private applyThemeToDom(company: CompanyType): void {
    const body = document.body;
    body.classList.remove('qualtop', 'sye');
    body.classList.add(company.toLowerCase());
  }

  /**
   * Cierra la sesión activa y limpia las clases de color del DOM
   */
  public logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    document.body.classList.remove('qualtop', 'sye');
    this.currentUserSubject.next(null);
  }
}