import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private apiService: ApiService) { }

  getMetricas(fechaInicio: string, fechaFin: string): Observable<any[]> {
    return this.apiService.get<any[]>(`/dashboard/metricas`, { fechaInicio, fechaFin }).pipe(
      map(response => response.datos || [])
    );
  }

  getEstadisticasMensuales(anio: number, mes: number): Observable<any[]> {
    return this.apiService.get<any[]>(`/dashboard/estadisticas-mensuales`, { anio, mes }).pipe(
      map(response => response.datos || [])
    );
  }

  getOcupacionGroomers(fecha: string): Observable<any[]> {
    return this.apiService.get<any[]>(`/groomers/ocupacion/${fecha}`).pipe(
      map(response => response.datos || [])
    );
  }

  getIngresos(fechaInicio: string, fechaFin: string, idSucursal: number): Observable<any[]> {
      return this.apiService.get<any[]>(`/reportes/ingresos`, { fechaInicio, fechaFin, idSucursal }).pipe(
          map(response => response.datos || [])
      );
  }
}
