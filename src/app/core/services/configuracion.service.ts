import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface IConfiguracionEstimacion {
  idConfiguracion?: number;
  idServicio: number;
  tamañoMascota?: string; // 'pequeño', 'mediano', 'grande'
  tipoPelaje?: string; // 'corto', 'medio', 'largo'
  tiempoEstimadoMin: number;
  factorComplejidad?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<IConfiguracionEstimacion[]> {
    return this.apiService.get<IConfiguracionEstimacion[]>('/api/admin/configuracion').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IConfiguracionEstimacion> {
    return this.apiService.get<IConfiguracionEstimacion>(`/api/admin/configuracion/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  getByServicio(idServicio: number): Observable<IConfiguracionEstimacion[]> {
    return this.apiService.get<IConfiguracionEstimacion[]>(`/api/admin/configuracion/servicio/${idServicio}`).pipe(
      map(response => response.datos || [])
    );
  }

  getTiempoEstimado(idServicio: number): Observable<number> {
    return this.apiService.get<number>(`/api/admin/configuracion/tiempo/${idServicio}`).pipe(
      map(response => response.datos!)
    );
  }

  create(config: IConfiguracionEstimacion): Observable<IConfiguracionEstimacion> {
    return this.apiService.post<IConfiguracionEstimacion>('/api/admin/configuracion', config).pipe(
      map(response => response.datos!)
    );
  }

  update(id: number, config: IConfiguracionEstimacion): Observable<IConfiguracionEstimacion> {
    return this.apiService.put<IConfiguracionEstimacion>(`/api/admin/configuracion/${id}`, config).pipe(
      map(response => response.datos!)
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/admin/configuracion/${id}`).pipe(
      map(() => undefined)
    );
  }
}
