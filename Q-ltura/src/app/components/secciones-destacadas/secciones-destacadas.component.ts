import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router'; // Importamos Router para la navegación real
import { addIcons } from 'ionicons';
import { 
  calendarOutline, 
  shieldCheckmarkOutline, 
  gitNetworkOutline, 
  callOutline, 
  arrowForwardOutline,
  mailOutline, // Para el modal
  logoWhatsapp // Para el modal
} from 'ionicons/icons';

export interface SeccionDestacada {
  id: string;
  title: string;
  description: string;
  icon: string;
  ctaText: string;
  colorClass: 'orange' | 'purple' | 'green';
  route?: string;
  action?: 'modal' | 'navigate'; // Para saber qué hacer al hacer clic
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

  // Control del Modal de Contacto
  isContactModalOpen = false;

  secciones: SeccionDestacada[] = [
    {
      id: 'eventos',
      title: 'Próximos eventos',
      description: 'Consulta el calendario de actividades y no te pierdas nada.',
      icon: 'calendar-outline',
      ctaText: 'Ver calendario',
      colorClass: 'orange',
      route: '/avisos',
      action: 'navigate'
    },
    {
      id: 'politicas',
      title: 'Políticas internas',
      description: 'Accede a las políticas y comunicados SGI actualizados.',
      icon: 'shield-checkmark-outline',
      ctaText: 'Ir a la biblioteca',
      colorClass: 'purple',
      route: '/politicas',
      action: 'navigate'
    },
    /* 
    --- ORGANIGRAMA COMENTADO PARA FUTURO USO ---
    {
      id: 'organigrama',
      title: 'Organigrama',
      description: 'Conoce a tu equipo y comunícate fácilmente.',
      icon: 'git-network-outline',
      ctaText: 'Ver organigrama',
      colorClass: 'green',
      route: '/organigrama',
      action: 'navigate'
    },
    */
    {
      id: 'contacto',
      title: 'Contáctanos',
      description: '¿Dudas o comentarios? Estamos para ayudarte.',
      icon: 'call-outline',
      ctaText: 'Ver contactos',
      colorClass: 'orange',
      action: 'modal' // Disparará el modal en lugar de navegar
    }
  ];

  constructor(private router: Router) {
    addIcons({
      'calendar-outline': calendarOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'git-network-outline': gitNetworkOutline,
      'call-outline': callOutline,
      'arrow-forward-outline': arrowForwardOutline,
      'mail-outline': mailOutline,
      'logo-whatsapp': logoWhatsapp
    });
  }

  ngOnInit(): void {}

  onCardClick(seccion: SeccionDestacada) {
    if (seccion.action === 'modal' && seccion.id === 'contacto') {
      this.isContactModalOpen = true;
    } else if (seccion.action === 'navigate' && seccion.route) {
      this.router.navigate([seccion.route]);
    }
  }

  closeContactModal() {
    this.isContactModalOpen = false;
  }
}