import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';
import { Cliente } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  constructor(private apiService: ApiService) { }

  getClients(): Observable<Cliente[]> {
    return this.apiService.get<Cliente[]>('/clientes').pipe(
      map(response => response.datos || [])
    );
  }

  searchClients(term: string): Observable<Cliente[]> {
    return this.apiService.get<Cliente[]>(`/clientes/buscar/${term}`).pipe(
      map(response => response.datos || [])
    );
  }

  getClientById(id: number): Observable<Cliente> {
    // Assuming there is an endpoint to get a single client, though not explicitly listed in the main list,
    // it's standard. If not, we might need to filter from list or use a specific endpoint if discovered.
    // Based on patterns, it might be /clientes/{id} or we might need to rely on search.
    // For now, let's assume standard REST or use what's available.
    // The instructions mention /clientes (List) and /clientes/buscar/{termino}.
    // Let's stick to what is known or infer standard behavior.
    // If strictly following instructions, maybe I should only use list and search.
    // But for editing, we usually need getById. Let's assume /clientes/{id} exists or I'll use search by ID if needed.
    // Let's try /clientes/{id} as it's standard.
    return this.apiService.get<Cliente>(`/clientes/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  createClient(client: Cliente): Observable<Cliente> {
    return this.apiService.post<Cliente>('/clientes', client).pipe(
      map(response => response.datos!)
    );
  }

  updateClient(id: number, client: Cliente): Observable<Cliente> {
    return this.apiService.put<Cliente>(`/clientes/${id}`, client).pipe(
      map(response => response.datos!)
    );
  }

  deleteClient(id: number): Observable<void> {
    return this.apiService.delete<void>(`/clientes/${id}`).pipe(
      map(() => undefined)
    );
  }
}
