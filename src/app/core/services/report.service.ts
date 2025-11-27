import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  constructor(private apiService: ApiService) {}

  getIngresos(fechaInicio: string, fechaFin: string, idSucursal?: number): Observable<any[]> {
    const params: any = { fechaInicio, fechaFin };
    if (idSucursal) params.idSucursal = idSucursal;

    return this.apiService.get<any[]>('/api/reportes/ingresos', params).pipe(
      map(response => response.datos || [])
    );
  }

  getClientesFrecuentes(): Observable<any[]> {
    return this.apiService.get<any[]>('/api/reportes/clientes-frecuentes').pipe(
      map(response => response.datos || [])
    );
  }

  getServiciosMasSolicitados(fechaInicio?: string, fechaFin?: string): Observable<any[]> {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    return this.apiService.get<any[]>('/api/reportes/servicios-mas-solicitados', params).pipe(
      map(response => response.datos || [])
    );
  }

  getFacturasCliente(idCliente: number): Observable<any[]> {
    return this.apiService.get<any[]>(`/api/reportes/facturas-cliente/${idCliente}`).pipe(
      map(response => response.datos || [])
    );
  }

  getPagosFactura(idFactura: number): Observable<any[]> {
    return this.apiService.get<any[]>(`/api/reportes/pagos-factura/${idFactura}`).pipe(
      map(response => response.datos || [])
    );
  }

  getAuditoria(limite: number = 100, entidad?: string, accion?: string): Observable<any[]> {
    const params: any = { limite };
    if (entidad) params.entidad = entidad;
    if (accion) params.accion = accion;

    return this.apiService.get<any[]>('/api/reportes/auditoria', params).pipe(
      map(response => response.datos || [])
    );
  }

  getResumenGeneral(fechaInicio: string, fechaFin: string): Observable<any> {
    return this.apiService.get<any>('/api/reportes/resumen-general', { fechaInicio, fechaFin }).pipe(
      map(response => response.datos || {})
    );
  }
}
