import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notificationService = inject(NotificationService);

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
            errorMessage = 'No autorizado. Por favor inicie sesión nuevamente.';
        } else if (error.status === 403) {
            errorMessage = 'Acceso denegado.';
        } else {
            errorMessage = `Error Código: ${error.status}\nMensaje: ${error.message}`;
        }
      }

      notificationService.error(errorMessage);
      return throwError(() => error);
    })
  );
};
