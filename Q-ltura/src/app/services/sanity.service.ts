// src/app/services/sanity.service.ts
import { Injectable } from '@angular/core';
import { createClient, SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

@Injectable({
  providedIn: 'root'
})
export class SanityService {
  private client: SanityClient = createClient({
    projectId: 'z7rydwf1',     // Tu Project ID de la captura
    dataset: 'production',    // Dataset por defecto
    useCdn: true,             // Caché rápido mundial
    apiVersion: '2024-01-01'  // Versión de la API de Sanity
  });

  private imageBuilder = imageUrlBuilder(this.client);

  /**
   * Ejecuta consultas GROQ en Sanity
   */
  async fetchQuery<T>(query: string, params: Record<string, any> = {}): Promise<T> {
    return await this.client.fetch<T>(query, params);
  }

  /**
   * Genera URLs optimizadas para imágenes cargadas en Sanity
   */
  urlFor(source: any) {
    return this.imageBuilder.image(source);
  }
}