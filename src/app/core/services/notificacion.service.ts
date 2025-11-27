import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface INotificacion {
  idNotificacion?: number;
  idCliente: number;
  tipo: 'email' | 'sms' | 'push';
  asunto: string;
  mensaje: string;
  estado: 'pendiente' | 'enviada' | 'leida' | 'fallida';
  fechaEnvio?: string;
  fechaLectura?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<INotificacion[]> {
    return this.apiService.get<INotificacion[]>('/api/notificaciones').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<INotificacion> {
    return this.apiService.get<INotificacion>(`/api/notificaciones/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  getByCliente(idCliente: number): Observable<INotificacion[]> {
    return this.apiService.get<INotificacion[]>(`/api/notificaciones/cliente/${idCliente}`).pipe(
      map(response => response.datos || [])
    );
  }

  getNoLeidas(idCliente: number): Observable<INotificacion[]> {
    return this.apiService.get<INotificacion[]>(`/api/notificaciones/cliente/${idCliente}/no-leidas`).pipe(
      map(response => response.datos || [])
    );
  }

  getPendientes(): Observable<INotificacion[]> {
    return this.apiService.get<INotificacion[]>('/api/notificaciones/pendientes').pipe(
      map(response => response.datos || [])
    );
  }

  create(notificacion: INotificacion): Observable<INotificacion> {
    return this.apiService.post<INotificacion>('/api/notificaciones', notificacion).pipe(
      map(response => response.datos!)
    );
  }

  update(id: number, notificacion: INotificacion): Observable<INotificacion> {
    return this.apiService.put<INotificacion>(`/api/notificaciones/${id}`, notificacion).pipe(
      map(response => response.datos!)
    );
  }

  marcarEnviada(id: number): Observable<INotificacion> {
    return this.apiService.put<INotificacion>(`/api/notificaciones/${id}/marcar-enviada`, {}).pipe(
      map(response => response.datos!)
    );
  }

  marcarLeida(id: number): Observable<INotificacion> {
    return this.apiService.put<INotificacion>(`/api/notificaciones/${id}/marcar-leida`, {}).pipe(
      map(response => response.datos!)
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/notificaciones/${id}`).pipe(
      map(() => undefined)
    );
  }
}
