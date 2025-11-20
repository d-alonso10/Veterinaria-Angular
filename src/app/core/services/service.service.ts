import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IServicio } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private apiService: ApiService) { }

  getServices(): Observable<IServicio[]> {
    return this.apiService.get<IServicio[]>('/servicios').pipe(
      map(response => response.datos || [])
    );
  }

  getServicesByCategory(category: string): Observable<IServicio[]> {
    return this.apiService.get<IServicio[]>(`/servicios/categoria/${category}`).pipe(
      map(response => response.datos || [])
    );
  }
}
