import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { ILoginResponse } from '../models/models';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSig = signal<{ username: string; rol: string } | null>(null);

  // Expose read-only signal
  currentUser = this.currentUserSig.asReadonly();

  constructor(private apiService: ApiService, private router: Router) {
    this.restoreSession();
  }

  login(credentials: any) {
    return this.apiService.post<ILoginResponse>('/auth/login', credentials).pipe(
      tap((response) => {
        if (response.exito && response.datos) {
          this.setSession(response.datos);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSig.set(null);
    this.router.navigate(['/login']);
  }

  // Dentro de setSession(authData: ILoginResponse)
  private setSession(authData: ILoginResponse) {
    localStorage.setItem('token', authData.token);
    // Guardamos nombre y email en lugar de username
    const user = {
      username: authData.email, // Usamos el email como identificador principal
      nombre: authData.nombre, // Guardamos el nombre real para mostrarlo
      rol: authData.rol,
    };
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSig.set(user);
  }

  private restoreSession() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSig.set(user);
      } catch (e) {
        console.error('Error parsing user data', e);
        this.logout();
      }
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
