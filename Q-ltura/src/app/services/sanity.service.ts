// src/app/services/sanity.service.ts
import { Injectable } from '@angular/core';
import { createClient, SanityClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SanityService {
  private client: SanityClient = createClient({
    projectId: 'z7rydwf1',    // Tu Project ID
    dataset: 'production',    // Dataset por defecto
    useCdn: false,            // Apagado para obtener cambios en vivo sin caché
    apiVersion: '2024-01-01'  // Versión de la API de Sanity
  });

  private imageBuilder = imageUrlBuilder(this.client);

  /**
   * Ejecuta consultas GROQ tradicionales en Sanity
   */
  async fetchQuery<T>(query: string, params: Record<string, any> = {}): Promise<T> {
    return await this.client.fetch<T>(query, params);
  }

  /**
   * Escucha eventos y mutaciones en tiempo real (Server-Sent Events)
   * Emite cada vez que un documento es creado, modificado o publicado.
   */
  listenQuery(query: string, params: Record<string, any> = {}): Observable<any> {
    return new Observable((observer) => {
      const subscription = this.client
        .listen(query, params, {
          includeResult: true,
          visibility: 'query'
        })
        .subscribe({
          next: (update) => observer.next(update),
          error: (err) => observer.error(err),
          complete: () => observer.complete()
        });

      // Teardown: cancela la conexión con Sanity al destruir el componente
      return () => subscription.unsubscribe();
    });
  }

  /**
   * Genera URLs optimizadas para imágenes cargadas en Sanity
   */
  urlFor(source: any) {
    return this.imageBuilder.image(source);
  }
}