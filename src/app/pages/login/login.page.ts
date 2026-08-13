import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonIcon, 
  IonSpinner, 
  ToastController 
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { CompanyType } from '../../shared/models/user.model';
import { addIcons } from 'ionicons';
import { 
  mailOutline, 
  lockClosedOutline, 
  arrowForwardOutline, 
  logoGoogle, 
  businessOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    IonContent, 
    IonIcon, 
    IonSpinner
  ]
})
export class LoginPage {

  private router = inject(Router);
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);

  email: string = '';
  password: string = '';
  selectedCompany: CompanyType = 'Qualtop';
  
  showCompanySelector: boolean = false;
  isLoading: boolean = false;

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      arrowForwardOutline,
      logoGoogle,
      businessOutline
    });
  }

  // Evalúa si mostrar el selector de empresa para correos generales
  onEmailChange(): void {
    const cleanEmail = this.email.toLowerCase().trim();

    if (cleanEmail.endsWith('@qualtop.com')) {
      this.selectedCompany = 'Qualtop';
      this.showCompanySelector = false;
    } else if (cleanEmail.endsWith('@sye.com')) {
      this.selectedCompany = 'SYE';
      this.showCompanySelector = false;
    } else if (cleanEmail.includes('@') && cleanEmail.split('@')[1]?.length > 2) {
      this.showCompanySelector = true;
    } else {
      this.showCompanySelector = false;
    }
  }

  // Login manual tradicional
  async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
      this.presentToast('Por favor ingresa correo y contraseña', 'warning');
      return;
    }
  
    this.isLoading = true;
  
    setTimeout(() => {
      this.authService.login(this.email, this.selectedCompany);
      this.isLoading = false;
      this.router.navigateByUrl('/home');
    }, 800);
  }

  // ⚡ ACCESO RÁPIDO PARA PROBAR LA DEMO CON UN SOLO TOQUE
  async quickDemoLogin(userId: string): Promise<void> {
    this.isLoading = true;
    const user = this.authService.loginAsDemo(userId);

    setTimeout(async () => {
      this.isLoading = false;
      
      await this.presentToast(
        `¡Bienvenido(a) ${user.name}! Sesión activa para ${user.company}`, 
        'secondary'
      );

      this.router.navigateByUrl('/home');
    }, 500);
  }

  loginWithGoogle(): void {
    this.presentToast('Conectando con Google Workspace...', 'secondary');
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'secondary'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2200,
      color,
      position: 'top',
      mode: 'ios'
    });
    await toast.present();
  }
}