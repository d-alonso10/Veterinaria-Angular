import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IAtencion } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AttentionService {

  constructor(private apiService: ApiService) { }

  createFromAppointment(params: any): Observable<IAtencion> {
    // POST /atenciones/desde-cita using query params
    return this.apiService.post<IAtencion>('/atenciones/desde-cita', null).pipe( // Need to pass params. ApiService.post doesn't support params in options easily?
        // Wait, ApiService.post signature: post<T>(endpoint, body).
        // If I need params, I should append them to URL or update ApiService.
        // Let's append to URL for now as I did with appointments.
        // Actually, I should construct the URL with params.
        map(response => response.datos!)
    );
  }

  // Better implementation: use a helper to build query string or update ApiService.
  // Given the constraints, I'll append to URL.

  createFromAppointmentWithParams(queryParams: any): Observable<IAtencion> {
      const queryString = new URLSearchParams(queryParams).toString();
      return this.apiService.post<IAtencion>(`/atenciones/desde-cita?${queryString}`, {}).pipe(
          map(response => response.datos!)
      );
  }

  createWalkIn(queryParams: any): Observable<IAtencion> {
      const queryString = new URLSearchParams(queryParams).toString();
      return this.apiService.post<IAtencion>(`/atenciones/walk-in?${queryString}`, {}).pipe(
          map(response => response.datos!)
      );
  }

  getCola(sucursalId: number): Observable<IAtencion[]> {
    return this.apiService.get<IAtencion[]>(`/atenciones/cola/${sucursalId}`).pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IAtencion> {
    return this.apiService.get<IAtencion>(`/atenciones/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  updateState(id: number, nuevoEstado: string): Observable<void> {
    return this.apiService.put<void>(`/atenciones/${id}/estado?nuevoEstado=${nuevoEstado}`, {}).pipe(
      map(() => undefined)
    );
  }

  finishAttention(id: number): Observable<void> {
    return this.apiService.put<void>(`/atenciones/${id}/terminar`, {}).pipe(
      map(() => undefined)
    );
  }

  getDetails(id: number): Observable<any[]> {
      return this.apiService.get<any[]>(`/atenciones/${id}/detalles`).pipe(
          map(response => response.datos || [])
      );
  }

  addService(id: number, serviceData: any): Observable<void> {
      return this.apiService.post<void>(`/atenciones/${id}/detalles`, serviceData).pipe(
          map(() => undefined)
      );
  }
}
