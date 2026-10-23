// sanity-studio/schemaTypes/slide.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'slide',
  title: 'Carrusel de Bienvenida (Hero)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título principal',
      type: 'string',
      description: 'Ejemplo: Data Community',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'highlightText',
      title: 'Texto resaltado (Acento de color)',
      type: 'string',
      description: 'Ejemplo: Meetup 2026'
    }),
    defineField({
      name: 'company',
      title: 'Empresa destino',
      type: 'string',
      description: '¿A qué colaboradores se les mostrará esta diapositiva?',
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
      name: 'tag',
      title: 'Etiqueta superior (Tag)',
      type: 'string',
      description: 'Ejemplo: CULTURA Y EVENTOS, CAPACITACIÓN TI'
    }),
    defineField({
      name: 'description',
      title: 'Descripción o bajada',
      type: 'text',
      rows: 3
    }),
    defineField({
      name: 'buttonText',
      title: 'Texto del botón de acción',
      type: 'string',
      initialValue: 'Confirmar asistencia'
    }),
    defineField({
      name: 'buttonUrl',
      title: 'Enlace o ruta interna',
      type: 'string',
      description: 'Ejemplo: /avisos o https://...'
    }),
    defineField({
      name: 'accentTheme',
      title: 'Color del tema',
      type: 'string',
      options: {
        list: [
          { title: 'Naranja (Qualtop Warm)', value: 'orange' },
          { title: 'Púrpura / Azul (SYE Tech)', value: 'purple' },
          { title: 'Azul Neutro', value: 'blue' }
        ]
      },
      initialValue: 'orange'
    }),
    defineField({
      name: 'image',
      title: 'Ilustración o portada del slide',
      type: 'image',
      options: {
        hotspot: true
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'order',
      title: 'Orden de aparición',
      type: 'number',
      description: '1 para el primer slide, 2 para el segundo, etc.',
      initialValue: 1
    })
  ]
});