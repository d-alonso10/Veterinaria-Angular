import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface IDetalleServicio {
  idDetalle?: number;
  idAtencion: number;
  idServicio: number;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  subtotal?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DetalleServicioService {
  constructor(private apiService: ApiService) {}

  getByAtencion(idAtencion: number): Observable<IDetalleServicio[]> {
    return this.apiService.get<IDetalleServicio[]>(`/api/atenciones/${idAtencion}/detalles`).pipe(
      map(response => response.datos || [])
    );
  }

  getById(idAtencion: number, idDetalle: number): Observable<IDetalleServicio> {
    return this.apiService.get<IDetalleServicio>(`/api/atenciones/${idAtencion}/detalles/${idDetalle}`).pipe(
      map(response => response.datos!)
    );
  }

  getSubtotal(idAtencion: number): Observable<number> {
    return this.apiService.get<number>(`/api/atenciones/${idAtencion}/detalles/subtotal`).pipe(
      map(response => response.datos!)
    );
  }

  create(idAtencion: number, detalle: IDetalleServicio): Observable<IDetalleServicio> {
    return this.apiService.post<IDetalleServicio>(`/api/atenciones/${idAtencion}/detalles`, detalle).pipe(
      map(response => response.datos!)
    );
  }

  update(idAtencion: number, idDetalle: number, detalle: IDetalleServicio): Observable<IDetalleServicio> {
    return this.apiService.put<IDetalleServicio>(`/api/atenciones/${idAtencion}/detalles/${idDetalle}`, detalle).pipe(
      map(response => response.datos!)
    );
  }

  delete(idAtencion: number, idDetalle: number): Observable<void> {
    return this.apiService.delete<void>(`/api/atenciones/${idAtencion}/detalles/${idDetalle}`).pipe(
      map(() => undefined)
    );
  }
}
