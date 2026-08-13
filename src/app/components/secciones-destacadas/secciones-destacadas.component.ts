import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { 
  calendarOutline, 
  shieldCheckmarkOutline, 
  gitNetworkOutline, 
  callOutline, 
  arrowForwardOutline 
} from 'ionicons/icons';

export interface SeccionDestacada {
  id: string;
  title: string;
  description: string;
  icon: string;
  ctaText: string;
  colorClass: 'orange' | 'purple' | 'green';
  route?: string;
}

@Component({
  selector: 'app-secciones-destacadas',
  templateUrl: './secciones-destacadas.component.html',
  styleUrls: ['./secciones-destacadas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class SeccionesDestacadasComponent implements OnInit {

  secciones: SeccionDestacada[] = [
    {
      id: 'eventos',
      title: 'Próximos eventos',
      description: 'Consulta el calendario de actividades y no te pierdas nada.',
      icon: 'calendar-outline',
      ctaText: 'Ver calendario',
      colorClass: 'orange',
      route: '/eventos'
    },
    {
      id: 'politicas',
      title: 'Políticas internas',
      description: 'Accede a las políticas y comunicados SGI actualizados.',
      icon: 'shield-checkmark-outline',
      ctaText: 'Ir a la biblioteca',
      colorClass: 'purple',
      route: '/politicas'
    },
    {
      id: 'organigrama',
      title: 'Organigrama',
      description: 'Conoce a tu equipo y comunícate fácilmente.',
      icon: 'git-network-outline',
      ctaText: 'Ver organigrama',
      colorClass: 'green',
      route: '/organigrama'
    },
    {
      id: 'contacto',
      title: 'Contáctanos',
      description: '¿Dudas o comentarios? Estamos para ayudarte.',
      icon: 'call-outline',
      ctaText: 'Ver contactos',
      colorClass: 'orange',
      route: '/contacto'
    }
  ];

  constructor() {
    // REGISTRAR LOS ÍCONOS DE IONIC
    addIcons({
      'calendar-outline': calendarOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'git-network-outline': gitNetworkOutline,
      'call-outline': callOutline,
      'arrow-forward-outline': arrowForwardOutline
    });
  }

  ngOnInit(): void {}

  onCardClick(seccion: SeccionDestacada) {
    console.log('Navegando a:', seccion.route);
  }

}