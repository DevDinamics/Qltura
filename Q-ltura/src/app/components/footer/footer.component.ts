import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  logoLinkedin, 
  logoFacebook, 
  logoInstagram, 
  logoYoutube 
} from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class FooterComponent implements OnInit {

  constructor() {
    addIcons({
      'logo-linkedin': logoLinkedin,
      'logo-facebook': logoFacebook,
      'logo-instagram': logoInstagram,
      'logo-youtube': logoYoutube
    });
  }

  ngOnInit(): void {}

}