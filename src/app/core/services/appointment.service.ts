import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ICita } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private api: ApiService) {}

  getAll(): Observable<ICita[]> {
    return this.api.get<ICita[]>('/citas').pipe(
      map(response => response.datos || [])
    );
  }

  getProximasByClient(clientId: number): Observable<ICita[]> {
    return this.api.get<ICita[]>(`/citas/cliente/${clientId}/proximas`).pipe(
      map(response => response.datos || [])
    );
  }

  create(cita: ICita): Observable<ICita> {
    return this.api.post<ICita>('/citas', cita).pipe(
      map(response => response.datos!)
    );
  }

  confirm(id: number): Observable<void> {
    return this.api.put<void>(`/citas/${id}/confirmar-asistencia`).pipe(
      map(() => undefined)
    );
  }

  cancel(id: number): Observable<void> {
    return this.api.put<void>(`/citas/${id}/cancelar`).pipe(
      map(() => undefined)
    );
  }

  reschedule(id: number, nuevaFecha: string): Observable<void> {
    return this.api.put<void>(`/citas/${id}/reprogramar?nuevaFecha=${nuevaFecha}`, {}).pipe(
      map(() => undefined)
    );
  }
}
