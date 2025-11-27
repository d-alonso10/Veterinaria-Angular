import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface IUsuarioSistema {
  idUsuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  password?: string;
  rol: 'admin' | 'recepcionista' | 'groomer' | 'veterinario' | 'contador';
  idSucursal: number;
  activo?: boolean;
}

export interface IChangePasswordRequest {
  contraseñaActual: string;
  contraseñaNueva: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<IUsuarioSistema[]> {
    return this.apiService.get<IUsuarioSistema[]>('/api/admin/usuarios').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IUsuarioSistema> {
    return this.apiService.get<IUsuarioSistema>(`/api/admin/usuarios/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  getByEmail(email: string): Observable<IUsuarioSistema> {
    return this.apiService.get<IUsuarioSistema>(`/api/admin/usuarios/email/${email}`).pipe(
      map(response => response.datos!)
    );
  }

  getByRole(rol: string): Observable<IUsuarioSistema[]> {
    return this.apiService.get<IUsuarioSistema[]>(`/api/admin/usuarios/rol/${rol}`).pipe(
      map(response => response.datos || [])
    );
  }

  create(user: IUsuarioSistema): Observable<IUsuarioSistema> {
    return this.apiService.post<IUsuarioSistema>('/api/admin/usuarios', user).pipe(
      map(response => response.datos!)
    );
  }

  update(id: number, user: IUsuarioSistema): Observable<IUsuarioSistema> {
    return this.apiService.put<IUsuarioSistema>(`/api/admin/usuarios/${id}`, user).pipe(
      map(response => response.datos!)
    );
  }

  changePassword(id: number, request: IChangePasswordRequest): Observable<IUsuarioSistema> {
    return this.apiService.put<IUsuarioSistema>(`/api/admin/usuarios/${id}/cambiar-contraseña`, request).pipe(
      map(response => response.datos!)
    );
  }

  delete(id: number): Observable<void> {
    return this.apiService.delete<void>(`/api/admin/usuarios/${id}`).pipe(
      map(() => undefined)
    );
  }
}
