import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonIcon, 
  IonSpinner, 
  ToastController,
  ViewWillEnter 
} from '@ionic/angular/standalone';
import { AuthService } from '../../services/auth.service';
import { CompanyType } from '../../shared/models/user.model';
import { addIcons } from 'ionicons';
import { 
  mailOutline, 
  lockClosedOutline, 
  arrowForwardOutline, 
  logoGoogle, 
  businessOutline,
  checkmarkOutline 
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
export class LoginPage implements ViewWillEnter {

  private router = inject(Router);
  private authService = inject(AuthService);
  private toastCtrl = inject(ToastController);
  private cdr = inject(ChangeDetectorRef);

  email: string = '';
  password: string = '';
  selectedCompany: CompanyType = 'Qualtop';
  
  showCompanySelector: boolean = false;
  isLoading: boolean = false;

  // Estado para la animación de bienvenida
  isAuthenticating: boolean = false;
  authUserData = {
    name: 'Colaborador',
    company: 'Qualtop',
    avatar: 'https://i.pravatar.cc/150?img=32'
  };

  constructor() {
    addIcons({
      mailOutline,
      lockClosedOutline,
      arrowForwardOutline,
      logoGoogle,
      businessOutline,
      checkmarkOutline
    });
  }

  // Se ejecuta automáticamente cada vez que Ionic entra a la vista (incluso tras un logout)
  ionViewWillEnter(): void {
    this.isAuthenticating = false;
    this.isLoading = false;
    this.password = '';
    this.cdr.markForCheck();
  }

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

  // Login manual
  async onLogin(): Promise<void> {
    if (!this.email || !this.password) {
      this.presentToast('Por favor ingresa correo y contraseña', 'warning');
      return;
    }
  
    this.isLoading = true;
  
    setTimeout(() => {
      this.isLoading = false;
      this.authService.login(this.email, this.selectedCompany);
      
      const inferredName = this.email.split('@')[0].split('.')[0];
      const capitalized = inferredName.charAt(0).toUpperCase() + inferredName.slice(1);

      this.triggerWelcomeTransition(
        capitalized || 'Colaborador', 
        this.selectedCompany, 
        'https://i.pravatar.cc/150?img=32'
      );
    }, 600);
  }

  // Acceso rápido demo
  async quickDemoLogin(userId: string): Promise<void> {
    this.isLoading = true;
    const user = this.authService.loginAsDemo(userId);

    setTimeout(() => {
      this.isLoading = false;
      this.triggerWelcomeTransition(
        user.name, 
        user.company as CompanyType, 
        user.avatar || 'https://i.pravatar.cc/150?img=32'
      );
    }, 400);
  }

  // Ejecuta la animación de entrada al portal
  private triggerWelcomeTransition(name: string, company: CompanyType, avatar: string): void {
    this.authUserData = { name, company, avatar };
    this.isAuthenticating = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.router.navigateByUrl('/home').then(() => {
        // Apaga la bandera para que la pantalla quede limpia al hacer logout
        this.isAuthenticating = false;
        this.cdr.markForCheck();
      });
    }, 1500);
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