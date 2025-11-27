import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IServicio } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  constructor(private apiService: ApiService) {}

  getServices(): Observable<IServicio[]> {
    return this.apiService.get<IServicio[]>('/servicios').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IServicio> {
    return this.apiService.get<IServicio>(`/servicios/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  getByCategory(categoria: string): Observable<IServicio[]> {
    return this.apiService.get<IServicio[]>(`/servicios/categoria/${categoria}`).pipe(
      map(response => response.datos || [])
    );
  }

  search(nombre: string): Observable<IServicio[]> {
    return this.apiService.get<IServicio[]>(`/servicios/buscar/${nombre}`).pipe(
      map(response => response.datos || [])
    );
  }

  create(service: IServicio): Observable<IServicio> {
    return this.apiService.post<IServicio>('/servicios', service).pipe(
      map(response => response.datos!)
    );
  }

  update(id: number, service: IServicio): Observable<IServicio> {
    return this.apiService.put<IServicio>(`/servicios/${id}`, service).pipe(
      map(response => response.datos!)
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/servicios/${id}`).pipe(
      map(() => undefined)
    );
  }
}
