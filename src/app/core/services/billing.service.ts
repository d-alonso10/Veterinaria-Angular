import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap, delay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IFactura } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<IFactura[]> {
    return this.apiService.get<IFactura[]>('/api/facturas').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IFactura> {
    return this.apiService.get<IFactura>(`/api/facturas/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  getByCliente(idCliente: number): Observable<IFactura[]> {
    return this.apiService.get<IFactura[]>(`/api/facturas/cliente/${idCliente}`).pipe(
      map(response => response.datos || [])
    );
  }

  // Modificado para retornar IFactura completa in lugar de solo mensaje
  createFactura(idAtencion: number, serie: string, numero: string, metodoPagoSugerido: string): Observable<IFactura> {
    return this.apiService.postFormUrlEncoded<string>('/api/facturas', { idAtencion, serie, numero, metodoPagoSugerido }).pipe(
      // Backend retorna mensaje, necesitamos buscar la factura creada
      // Esperar un poco para que esté disponible en la BD
      switchMap(() => this.getByAtencionWithRetry(idAtencion, 0)),
      map(factura => {
        if (!factura) {
          throw new Error('Factura creada pero no encontrada');
        }
        return factura;
      })
    );
  }

  // Método auxiliar para reintentar búsqueda de factura
  private getByAtencionWithRetry(idAtencion: number, attempt: number): Observable<IFactura | null> {
    return this.getByAtencion(idAtencion).pipe(
      switchMap(factura => {
        if (factura) {
          return of(factura);
        }
        // Si no se encontró y tenemos reintentos disponibles
        if (attempt < 3) {
          console.log(`🔄 Reintento ${attempt + 1}/3 para encontrar factura...`);
          return of(null).pipe(
            delay(800), // Esperar 800ms
            switchMap(() => this.getByAtencionWithRetry(idAtencion, attempt + 1))
          );
        }
        return of(null);
      })
    );
  }

  // Obtener factura por ID de atención
  getByAtencion(idAtencion: number): Observable<IFactura | null> {
    console.log('🔍 Buscando factura para idAtencion:', idAtencion);
    return this.getAll().pipe(
      map(facturas => {
        console.log('📋 Total facturas disponibles:', facturas.length);

        // Filtrar facturas que coincidan con el idAtencion
        const facturasMatch = facturas.filter(f => {
          const match = f.idAtencion === idAtencion || f.atencion?.idAtencion === idAtencion;
          if (match) {
            console.log(`✅ Match encontrado: Factura #${f.idFactura}, serie=${f.serie}, numero=${f.numero}`);
          }
          return match;
        });

        if (facturasMatch.length === 0) {
          console.log('❌ No se encontraron facturas para idAtencion:', idAtencion);
          return null;
        }

        // Ordenar por fecha de creación (más reciente primero) y tomar la primera
        facturasMatch.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA; // Descendente
        });

        const factura = facturasMatch[0];
        console.log(`✅ Factura seleccionada (más reciente): #${factura.idFactura}`);

        return factura;
      })
    );
  }

  recalculateAll(): Observable<string> {
    return this.apiService.post<string>('/api/facturas/recalcular', null).pipe(
      map(response => response.datos!)
    );
  }

  anular(id: number): Observable<string> {
    return this.apiService.delete<string>(`/api/facturas/${id}`).pipe(
      map(response => response.datos!)
    );
  }
}
