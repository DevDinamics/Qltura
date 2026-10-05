import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  helpBuoyOutline,
  shieldCheckmarkOutline,
  mailUnreadOutline,
  hardwareChipOutline,
  peopleOutline,
  appsOutline,
  lockClosedOutline,
  documentTextOutline,
  ribbonOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, IonIcon]
})
export class FooterComponent {

  constructor() {
    addIcons({
      helpBuoyOutline,
      shieldCheckmarkOutline,
      mailUnreadOutline,
      hardwareChipOutline,
      peopleOutline,
      appsOutline,
      lockClosedOutline,
      documentTextOutline,
      ribbonOutline
    });
  }
}