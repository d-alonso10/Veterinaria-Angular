import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IAtencion } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AttentionService {

  constructor(private apiService: ApiService) { }

  // 🔧 CORREGIDO: Ahora maneja null si backend no devuelve la atención
  createFromAppointment(params: any): Observable<IAtencion | null> {
    return this.apiService.postFormUrlEncoded<IAtencion>('/api/atenciones/desde-cita', params).pipe(
      map(response => {
        console.log('📡 Backend response:', response.datos);
        return response.datos || null;
      }),
      catchError(error => {
        console.error('❌ Error creando atención:', error);
        return of(null);
      })
    );
  }

  // 🔧 CORREGIDO: Ahora maneja null si backend no devuelve la atención
  createWalkIn(params: any): Observable<IAtencion | null> {
    return this.apiService.postFormUrlEncoded<IAtencion>('/api/atenciones/walk-in', params).pipe(
      map(response => {
        console.log('📡 Backend response:', response.datos);
        return response.datos || null;
      }),
      catchError(error => {
        console.error('❌ Error creando atención walk-in:', error);
        return of(null);
      })
    );
  }

  getCola(sucursalId: number): Observable<IAtencion[]> {
    return this.apiService.get<IAtencion[]>(`/api/atenciones/cola/${sucursalId}`).pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IAtencion> {
    return this.apiService.get<IAtencion>(`/api/atenciones/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  updateState(id: number, nuevoEstado: string): Observable<void> {
    return this.apiService.put<void>(`/api/atenciones/${id}/estado`, {}, { nuevoEstado }).pipe(
      map(() => undefined)
    );
  }

  finishAttention(id: number): Observable<void> {
    return this.apiService.put<void>(`/api/atenciones/${id}/terminar`, {}).pipe(
      map(() => undefined)
    );
  }

  getDetails(id: number): Observable<any[]> {
      return this.apiService.get<any[]>(`/api/atenciones/${id}/detalles`).pipe(
          map(response => response.datos || [])
      );
  }

  addService(id: number, serviceData: any): Observable<void> {
      return this.apiService.post<void>(`/api/atenciones/${id}/detalles`, serviceData).pipe(
          map(() => undefined)
      );
  }

  // Alias para compatibilidad
  updateEstado(id: number, nuevoEstado: string): Observable<void> {
    return this.updateState(id, nuevoEstado);
  }
}
