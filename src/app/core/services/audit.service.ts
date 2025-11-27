import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface IAuditLog {
  idLog?: number;
  idUsuario: number;
  accion: string;
  entidad: string;
  idEntidad: number;
  detalles?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<IAuditLog[]> {
    return this.apiService.get<IAuditLog[]>('/api/admin/audit').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IAuditLog> {
    return this.apiService.get<IAuditLog>(`/api/admin/audit/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  getByUsuario(idUsuario: number): Observable<IAuditLog[]> {
    return this.apiService.get<IAuditLog[]>(`/api/admin/audit/usuario/${idUsuario}`).pipe(
      map(response => response.datos || [])
    );
  }

  getByFecha(fecha: string): Observable<IAuditLog[]> {
    return this.apiService.get<IAuditLog[]>(`/api/admin/audit/fecha/${fecha}`).pipe(
      map(response => response.datos || [])
    );
  }

  getByAccion(accion: string): Observable<IAuditLog[]> {
    return this.apiService.get<IAuditLog[]>(`/api/admin/audit/accion/${accion}`).pipe(
      map(response => response.datos || [])
    );
  }

  getWithLimit(limite: number): Observable<IAuditLog[]> {
    return this.apiService.get<IAuditLog[]>(`/api/admin/audit/limite/${limite}`).pipe(
      map(response => response.datos || [])
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/admin/audit/${id}`).pipe(
      map(() => undefined)
    );
  }
}
