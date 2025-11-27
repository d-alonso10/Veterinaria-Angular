import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

// DTO que coincide con el backend
export interface MetricasDashboard {
  totalClientes: number;
  totalMascotas: number;
  citasHoy: number;
  ingresosPeriodo: number;
  atencionesEnCurso: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private apiService: ApiService) {}

  // Dashboard endpoints - Ahora retorna un OBJETO (no array)
  getMetricas(fechaInicio: string = '2025-01-01', fechaFin?: string): Observable<MetricasDashboard> {
    const params: any = { fechaInicio };
    if (fechaFin) params.fechaFin = fechaFin;

    return this.apiService.get<MetricasDashboard>('/api/dashboard/metricas', params).pipe(
      map(response => response.datos!) // datos es un objeto, no un array
    );
  }

  getCola(idSucursal: number): Observable<any[]> {
    return this.apiService.get<any[]>(`/api/dashboard/cola/${idSucursal}`).pipe(
      map(response => response.datos || [])
    );
  }

  getEstadisticasMensuales(anio: number, mes: number): Observable<any[]> {
    return this.apiService.get<any[]>('/api/dashboard/estadisticas-mensuales', { anio, mes }).pipe(
      map(response => response.datos || [])
    );
  }

  getProximasCitas(idCliente: number): Observable<any[]> {
    return this.apiService.get<any[]>(`/api/dashboard/proximas-citas/${idCliente}`).pipe(
      map(response => response.datos || [])
    );
  }

  getHistorialMascota(idMascota: number): Observable<any[]> {
    return this.apiService.get<any[]>(`/api/dashboard/historial-mascota/${idMascota}`).pipe(
      map(response => response.datos || [])
    );
  }

  // Report endpoints (kept for backward compatibility)
  getOcupacionGroomers(fecha: string): Observable<any[]> {
    return this.apiService.get<any[]>(`/api/groomers/ocupacion/${fecha}`).pipe(
      map(response => response.datos || [])
    );
  }

  getIngresos(fechaInicio: string, fechaFin: string, idSucursal: number): Observable<any[]> {
    return this.apiService.get<any[]>('/api/reportes/ingresos', { fechaInicio, fechaFin, idSucursal }).pipe(
      map(response => response.datos || [])
    );
  }

  getTopClientes(limit: number = 5): Observable<any[]> {
    return this.apiService.get<any[]>('/api/reportes/clientes-frecuentes', { limit }).pipe(
      map(response => response.datos || [])
    );
  }

  getIngresosReporte(fechaInicio: string, fechaFin: string, idSucursal: number): Observable<any[]> {
    return this.apiService.get<any[]>('/api/reportes/ingresos', { fechaInicio, fechaFin, idSucursal }).pipe(
      map(response => response.datos || [])
    );
  }
}
