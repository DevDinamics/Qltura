import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonIcon, 
  IonSpinner, 
  ToastController,
  ViewWillEnter 
} from '@ionic/angular/standalone';
import { AuthService, CompanyType } from '../../services/auth.service';
import { addIcons } from 'ionicons';
import { 
  logoGoogle, 
  shieldCheckmarkOutline,
  lockClosedOutline,
  checkmarkOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
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

  isLoading: boolean = false;
  isAuthenticating: boolean = false;

  authUserData = {
    name: 'Colaborador',
    company: 'Qualtop' as CompanyType,
    avatar: 'https://i.pravatar.cc/150?img=32'
  };

  constructor() {
    addIcons({
      logoGoogle,
      shieldCheckmarkOutline,
      lockClosedOutline,
      checkmarkOutline
    });
  }

  ionViewWillEnter(): void {
    this.isAuthenticating = false;
    this.isLoading = false;
    this.cdr.markForCheck();
  }

  // 1. Acceso Principal mediante Google Workspace SSO
  async loginWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.cdr.markForCheck();

    try {
      const user = await this.authService.loginWithGoogleWorkspace();
      this.triggerWelcomeTransition(
        user.name, 
        user.company, 
        user.avatar || 'https://i.pravatar.cc/150?img=32'
      );
    } catch (error) {
      console.error('Error Google Auth:', error);
      this.presentToast('Error al conectar con Google Workspace', 'warning');
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  // 2. Acceso Rápido Demo (Ana -> Qualtop | Carlos -> SYE)
  quickDemoLogin(profile: 'ana' | 'carlos' | string): void {
    this.isLoading = true;
    const user = this.authService.loginAsDemo(profile as 'ana' | 'carlos');

    setTimeout(() => {
      this.isLoading = false;
      this.triggerWelcomeTransition(
        user.name, 
        user.company, 
        user.avatar || 'https://i.pravatar.cc/150?img=32'
      );
    }, 250);
  }

  private triggerWelcomeTransition(name: string, company: CompanyType, avatar: string): void {
    this.authUserData = { name, company, avatar };
    this.isAuthenticating = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      this.router.navigateByUrl('/home').then(() => {
        this.isAuthenticating = false;
        this.cdr.markForCheck();
      });
    }, 1400);
  }

  private async presentToast(message: string, color: 'success' | 'warning' | 'secondary'): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'top',
      mode: 'ios'
    });
    await toast.present();
  }
}