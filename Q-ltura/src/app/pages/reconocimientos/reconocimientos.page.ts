import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trophyOutline, sparklesOutline } from 'ionicons/icons';

import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reconocimientos',
  templateUrl: './reconocimientos.page.html',
  styleUrls: ['./reconocimientos.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, NavbarComponent, FooterComponent]
})
export class ReconocimientosPage implements OnInit {
  
  private authService = inject(AuthService);
  currentCompany: string = 'Qualtop';

  constructor() {
    addIcons({ trophyOutline, sparklesOutline });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user && user.company) {
        this.currentCompany = user.company;
      }
    });
  }
}