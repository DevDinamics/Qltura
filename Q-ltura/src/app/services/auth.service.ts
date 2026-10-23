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

// Alias de compatibilidad para vistas dependientes
export type AppUser = UserSession;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'user_session';

  private currentUserSubject = new BehaviorSubject<UserSession | null>(null);
  public currentUser$: Observable<UserSession | null> = this.currentUserSubject.asObservable();

  // Usuarios preconfigurados para entorno demo
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

  // Carga de sesion persistida en almacenamiento local
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

  // Obtencion sincronica del estado de usuario activo
  public get currentUserValue(): UserSession | null {
    return this.currentUserSubject.value;
  }

  // Autenticacion rapida por identificador demo
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

  // Autenticacion manual con resolucion de perfil
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

  // Metodo puente para flujo de acceso con correo
  public loginWithEmail(email: string, company: CompanyType = 'Qualtop'): UserSession {
    return this.login(email, company);
  }

  // Integracion asincrona con Google Workspace
  public async loginWithGoogleWorkspace(googleCredential?: any): Promise<UserSession> {
    const mockEmail = 'diego.delgado@qualtop.com';
    return this.login(mockEmail, 'Qualtop');
  }

  // Persistencia de sesion y actualizacion de estado
  private saveSession(session: UserSession): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    this.applyThemeToDom(session.company);
    this.currentUserSubject.next(session);
  }

  // Inyeccion de clase de marca en el contenedor raiz
  private applyThemeToDom(company: CompanyType): void {
    const body = document.body;
    body.classList.remove('qualtop', 'sye');
    body.classList.add(company.toLowerCase());
  }

  // Cierre de sesion y restablecimiento de variables globales
  public logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    document.body.classList.remove('qualtop', 'sye');
    this.currentUserSubject.next(null);
  }
}