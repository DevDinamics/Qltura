import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
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

@Component({
  selector: 'app-denuncia',
  templateUrl: './denuncia.page.html',
  styleUrls: ['./denuncia.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NavbarComponent,
    FooterComponent
  ]
})
export class DenunciaPage implements OnInit {

  showModal: boolean = false;
  iframeUrl: SafeResourceUrl | null = null;
  selectedSite: 'qualtop' | 'sye' = 'qualtop'; // Por defecto

  constructor(private sanitizer: DomSanitizer) {
    addIcons({
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'lock-closed-outline': lockClosedOutline,
      'eye-off-outline': eyeOffOutline,
      'cash-outline': cashOutline,
      'heart-outline': heartOutline,
      'briefcase-outline': briefcaseOutline,
      'arrow-forward-outline': arrowForwardOutline,
      'document-text-outline': documentTextOutline,
      'close-outline': closeOutline
    });
  }

  ngOnInit(): void {}

  openDenunciaModal(site: 'qualtop' | 'sye' = 'qualtop') {
    this.selectedSite = site;
    const rawUrl = `https://qrewards.qualtop.com/api/denouncement/?site=${site}`;
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.iframeUrl = null;
  }

}