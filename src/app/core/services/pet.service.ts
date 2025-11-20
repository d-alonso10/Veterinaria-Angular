import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IMascota } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PetService {

  constructor(private apiService: ApiService) { }

  getPets(): Observable<IMascota[]> {
    return this.apiService.get<IMascota[]>('/mascotas').pipe(
      map(response => response.datos || [])
    );
  }

  getPetsByClient(clientId: number): Observable<IMascota[]> {
    return this.apiService.get<IMascota[]>(`/mascotas/cliente/${clientId}`).pipe(
      map(response => response.datos || [])
    );
  }

  getPetById(id: number): Observable<IMascota> {
    return this.apiService.get<IMascota>(`/mascotas/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  createPet(pet: IMascota): Observable<IMascota> {
    return this.apiService.post<IMascota>('/mascotas', pet).pipe(
      map(response => response.datos!)
    );
  }

  updatePet(id: number, pet: IMascota): Observable<IMascota> {
    return this.apiService.put<IMascota>(`/mascotas/${id}`, pet).pipe(
      map(response => response.datos!)
    );
  }

  deletePet(id: number): Observable<void> {
    return this.apiService.delete<void>(`/mascotas/${id}`).pipe(
      map(() => undefined)
    );
  }
}
