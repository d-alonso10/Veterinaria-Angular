import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado';

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        if (error.error && error.error.mensaje) {
            errorMessage = error.error.mensaje;
        } else if (error.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            errorMessage = 'Sesión expirada. Por favor inicie sesión nuevamente.';
            router.navigate(['/login']);
        } else if (error.status === 403) {
            errorMessage = 'No tiene permisos para realizar esta acción.';
        } else {
            errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
        }
      }

      notificationService.error(errorMessage);
      return throwError(() => error);
    })
  );
};
