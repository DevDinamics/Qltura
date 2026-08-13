import { trigger, transition, style, query, animate } from '@angular/animations';

export const fadeRouteAnimation = trigger('fadeRouteAnimation', [
  transition('* <=> *', [
    // Prepara únicamente la vista entrante sin alterar posicionamiento del layout
    query(':enter', [
      style({
        opacity: 0
      }),
      animate('200ms ease-out', style({
        opacity: 1
      }))
    ], { optional: true })
  ])
]);