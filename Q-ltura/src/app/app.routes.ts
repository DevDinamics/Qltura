import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
    data: { animation: 'LoginPage' }
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    data: { animation: 'HomePage' }
  },
  {
    path: 'avisos',
    loadComponent: () => import('./pages/avisos/avisos.page').then((m) => m.AvisosPage),
    data: { animation: 'AvisosPage' }
  },
  {
    path: 'plataformas',
    loadComponent: () => import('./pages/plataformas/plataformas.page').then((m) => m.PlataformasPage),
    data: { animation: 'PlataformasPage' }
  },
  {
    path: 'denuncia',
    loadComponent: () => import('./pages/denuncia/denuncia.page').then((m) => m.DenunciaPage),
    data: { animation: 'DenunciaPage' }
  },
  {
    path: 'mas',
    loadComponent: () => import('./pages/mas/mas.page').then((m) => m.MasPage),
    data: { animation: 'MasPage' }
  },
  // 👇 AQUÍ: antes del comodín
  {
    path: 'reconocimientos',
    loadComponent: () => import('./pages/reconocimientos/reconocimientos.page').then((m) => m.ReconocimientosPage),
    data: { animation: 'ReconocimientosPage' }
  },
  
  {
    path: 'beneficios',
    loadComponent: () => import('./pages/beneficios/beneficios.page').then( m => m.BeneficiosPage)
  },

  {
    path: '**',
    redirectTo: 'login',
  }
];