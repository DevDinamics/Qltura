// sanity-studio/schemaTypes/activity.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'activity',
  title: 'Agenda & Actividades Corporativas',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título del evento o aviso',
      type: 'string',
      description: 'Ejemplo: Celebremos a los cumpleañeros de Julio',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'company',
      title: 'Empresa destino',
      type: 'string',
      description: '¿Quién verá esta actividad?',
      options: {
        list: [
          { title: 'Solo Qualtop', value: 'Qualtop' },
          { title: 'Solo SYE', value: 'SYE' },
          { title: 'Ambas empresas (Global)', value: 'Ambas' }
        ],
        layout: 'radio'
      },
      initialValue: 'Ambas',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          { title: 'Festejos & Cultura', value: 'festejos' },
          { title: 'Sistemas & TI', value: 'sistemas' },
          { title: 'Oficial & Estrategia', value: 'cultura' }
        ]
      },
      initialValue: 'festejos',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'categoryLabel',
      title: 'Etiqueta visible de la categoría',
      type: 'string',
      description: 'Ejemplo: Festejo & Cultura, Sistemas & TI, Oficial & Estrategia',
      initialValue: 'Festejo & Cultura'
    }),
    defineField({
      name: 'isOnline',
      title: '¿Es evento en línea?',
      type: 'boolean',
      description: 'Muestra la insignia con icono de cámara "En Línea"',
      initialValue: false
    }),
    defineField({
      name: 'eventDate',
      title: 'Fecha y hora del evento',
      type: 'datetime',
      description: 'Se usará para ordenar cronológicamente la agenda',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'timeRange',
      title: 'Texto de fecha y horario completo',
      type: 'string',
      description: 'Ejemplo: Martes, 28 de Julio • 10:30 AM - 11:00 AM'
    }),
    defineField({
      name: 'location',
      title: 'Ubicación o enlace',
      type: 'string',
      description: 'Ejemplo: Oficinas Parque Lira • Comedor o Microsoft Teams / Remoto'
    }),
    defineField({
      name: 'description',
      title: 'Descripción del evento',
      type: 'text',
      rows: 3
    })
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'timeRange'
    }
  }
});