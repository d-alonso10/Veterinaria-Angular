import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface ISucursal {
  idSucursal?: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  horarioApertura?: string;
  horarioCierre?: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<ISucursal[]> {
    return this.apiService.get<ISucursal[]>('/api/admin/sucursales').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<ISucursal> {
    return this.apiService.get<ISucursal>(`/api/admin/sucursales/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  create(branch: ISucursal): Observable<ISucursal> {
    return this.apiService.post<ISucursal>('/api/admin/sucursales', branch).pipe(
      map(response => response.datos!)
    );
  }

  update(id: number, branch: ISucursal): Observable<ISucursal> {
    return this.apiService.put<ISucursal>(`/api/admin/sucursales/${id}`, branch).pipe(
      map(response => response.datos!)
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/admin/sucursales/${id}`).pipe(
      map(() => undefined)
    );
  }
}
