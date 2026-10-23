import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IonContent, IonIcon, IonModal } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  shieldCheckmarkOutline, 
  lockClosedOutline, 
  eyeOffOutline, 
  cashOutline, 
  heartOutline, 
  briefcaseOutline, 
  arrowForwardOutline,
  documentTextOutline,
  closeOutline
} from 'ionicons/icons';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';

type CompanySite = 'qualtop' | 'sye';

@Component({
  selector: 'app-denuncia',
  templateUrl: './denuncia.page.html',
  styleUrls: ['./denuncia.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonModal,
    NavbarComponent,
    FooterComponent
  ]
})
export class DenunciaPage implements OnInit, OnDestroy {

  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  showModal: boolean = false;
  iframeUrl: SafeResourceUrl | null = null;
  selectedSite: CompanySite = 'qualtop';

  // Rutas externas oficiales del portal de denuncia
  private readonly DENUNCIA_URLS: Record<CompanySite, string> = {
    sye: 'https://denuncia.qualtop.com:8092/denouncement/public/sye',
    qualtop: 'https://denuncia.qualtop.com:8092/denouncement/public/qualtop'
  };

  constructor() {
    addIcons({
      shieldCheckmarkOutline,
      lockClosedOutline,
      eyeOffOutline,
      cashOutline,
      heartOutline,
      briefcaseOutline,
      arrowForwardOutline,
      documentTextOutline,
      closeOutline
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user && user.company) {
          this.selectedSite = user.company.toLowerCase() === 'sye' ? 'sye' : 'qualtop';
          this.cdr.markForCheck();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Redireccion a la plataforma externa segun la empresa
  public goToExternalDenuncia(): void {
    const targetUrl = this.DENUNCIA_URLS[this.selectedSite] || this.DENUNCIA_URLS.qualtop;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }

  // Apertura modal con iframe (opcional)
  public openDenunciaModal(site?: CompanySite): void {
    const activeSite = site || this.selectedSite;
    const rawUrl = this.DENUNCIA_URLS[activeSite] || this.DENUNCIA_URLS.qualtop;
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
    this.showModal = true;
    this.cdr.markForCheck();
  }

  public closeModal(): void {
    this.showModal = false;
    this.iframeUrl = null;
    this.cdr.markForCheck();
  }
}