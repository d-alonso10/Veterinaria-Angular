import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface IPaqueteServicio {
  idPaquete?: number;
  nombre: string;
  descripcion: string;
  precioBase: number;
  descuento: number;
  activo?: boolean;
  serviciosIncluidos?: number[]; // IDs de servicios
}

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<IPaqueteServicio[]> {
    return this.apiService.get<IPaqueteServicio[]>('/api/servicios/paquetes').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IPaqueteServicio> {
    return this.apiService.get<IPaqueteServicio>(`/api/servicios/paquetes/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  getActive(): Observable<IPaqueteServicio[]> {
    return this.apiService.get<IPaqueteServicio[]>('/api/servicios/paquetes/activos').pipe(
      map(response => response.datos || [])
    );
  }

  getFinalPrice(id: number): Observable<number> {
    return this.apiService.get<number>(`/api/servicios/paquetes/${id}/precio-final`).pipe(
      map(response => response.datos!)
    );
  }

  create(packageData: IPaqueteServicio): Observable<IPaqueteServicio> {
    return this.apiService.post<IPaqueteServicio>('/api/servicios/paquetes', packageData).pipe(
      map(response => response.datos!)
    );
  }

  update(id: number, packageData: IPaqueteServicio): Observable<IPaqueteServicio> {
    return this.apiService.put<IPaqueteServicio>(`/api/servicios/paquetes/${id}`, packageData).pipe(
      map(response => response.datos!)
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/servicios/paquetes/${id}`).pipe(
      map(() => undefined)
    );
  }
}
