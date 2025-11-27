import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface IPromocion {
  idPromocion?: number;
  codigo: string;
  descripcion: string;
  descuento: number;
  fechaInicio: string;
  fechaFin: string;
  activo?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PromocionService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<IPromocion[]> {
    return this.apiService.get<IPromocion[]>('/api/promociones').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IPromocion> {
    return this.apiService.get<IPromocion>(`/api/promociones/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  getActive(): Observable<IPromocion[]> {
    return this.apiService.get<IPromocion[]>('/api/promociones/activas').pipe(
      map(response => response.datos || [])
    );
  }

  isValid(id: number): Observable<boolean> {
    return this.apiService.get<boolean>(`/api/promociones/${id}/valida`).pipe(
      map(response => response.datos!)
    );
  }

  create(promocion: IPromocion): Observable<IPromocion> {
    return this.apiService.post<IPromocion>('/api/promociones', promocion).pipe(
      map(response => response.datos!)
    );
  }

  update(id: number, promocion: IPromocion): Observable<IPromocion> {
    return this.apiService.put<IPromocion>(`/api/promociones/${id}`, promocion).pipe(
      map(response => response.datos!)
    );
  }

  activate(id: number): Observable<IPromocion> {
    return this.apiService.put<IPromocion>(`/api/promociones/${id}/activar`, {}).pipe(
      map(response => response.datos!)
    );
  }

  deactivate(id: number): Observable<IPromocion> {
    return this.apiService.put<IPromocion>(`/api/promociones/${id}/desactivar`, {}).pipe(
      map(response => response.datos!)
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/promociones/${id}`).pipe(
      map(() => undefined)
    );
  }
}
