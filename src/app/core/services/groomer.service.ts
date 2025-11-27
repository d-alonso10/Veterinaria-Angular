import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface IGroomer {
  idGroomer?: number;
  nombre: string;
  especialidades: string; // JSON string array
  disponibilidad: string; // JSON string object
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GroomerService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<IGroomer[]> {
    return this.apiService.get<IGroomer[]>('/api/groomers').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IGroomer> {
    return this.apiService.get<IGroomer>(`/api/groomers/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  getBySpecialty(especialidad: string): Observable<IGroomer[]> {
    return this.apiService.get<IGroomer[]>(`/api/groomers/especialidad/${especialidad}`).pipe(
      map(response => response.datos || [])
    );
  }

  getAvailability(fecha: string): Observable<any[]> {
    return this.apiService.get<any[]>(`/api/groomers/disponibilidad/${fecha}`).pipe(
      map(response => response.datos || [])
    );
  }

  getOccupancy(fecha: string): Observable<any[]> {
    return this.apiService.get<any[]>(`/api/groomers/ocupacion/${fecha}`).pipe(
      map(response => response.datos || [])
    );
  }

  getAverageTimes(fechaInicio?: string, fechaFin?: string): Observable<any[]> {
    const params: any = {};
    if (fechaInicio) params.fechaInicio = fechaInicio;
    if (fechaFin) params.fechaFin = fechaFin;

    return this.apiService.get<any[]>('/api/groomers/tiempos-promedio', params).pipe(
      map(response => response.datos || [])
    );
  }

  checkAvailability(idGroomer: number, fecha: string, minutos: number): Observable<boolean> {
    return this.apiService.get<boolean>(`/api/groomers/disponible/${idGroomer}/${fecha}/${minutos}`).pipe(
      map(response => response.datos!)
    );
  }

  create(groomer: IGroomer): Observable<IGroomer> {
    return this.apiService.post<IGroomer>('/api/groomers', groomer).pipe(
      map(response => response.datos!)
    );
  }

  update(id: number, groomer: IGroomer): Observable<IGroomer> {
    return this.apiService.put<IGroomer>(`/api/groomers/${id}`, groomer).pipe(
      map(response => response.datos!)
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/groomers/${id}`).pipe(
      map(() => undefined)
    );
  }
}
