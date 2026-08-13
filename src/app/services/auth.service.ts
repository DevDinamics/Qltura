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

@Injectable({
  providedIn: 'root'
})
export class AuthService {

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
   * Carga la sesión guardada desde localStorage al iniciar la app.
   */
  private loadInitialSession(): void {
    try {
      const saved = localStorage.getItem('user_session');
      if (saved) {
        this.currentUserSubject.next(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error al parsear la sesión activa:', error);
      localStorage.removeItem('user_session');
    }
  }

  /**
   * Retorna el valor actual síncrono del usuario autenticado.
   */
  public get currentUserValue(): UserSession | null {
    return this.currentUserSubject.value;
  }

  /**
   * Inicia sesión seleccionando una cuenta de prueba rápida (Ana o Carlos).
   */
  public loginAsDemo(userId: string): UserSession {
    const user = this.demoUsers.find(u => u.id === userId) || this.demoUsers[0];
    this.saveSession(user);
    return user;
  }

  /**
   * Inicia sesión con correo y empresa seleccionados manualmente.
   */
  public login(email: string, company: CompanyType): UserSession {
    // Si coincide con alguno de los correos demo, cargamos su perfil completo
    const existingDemo = this.demoUsers.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existingDemo) {
      this.saveSession(existingDemo);
      return existingDemo;
    }

    // Si es un correo nuevo, construimos la sesión dinámicamente
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
   * Guarda la sesión en localStorage y notifica a los suscriptores.
   */
  private saveSession(session: UserSession): void {
    localStorage.setItem('user_session', JSON.stringify(session));
    this.currentUserSubject.next(session);
  }

  /**
   * Cierra la sesión activa y limpia el almacenamiento local.
   */
  public logout(): void {
    localStorage.removeItem('user_session');
    this.currentUserSubject.next(null);
  }
}