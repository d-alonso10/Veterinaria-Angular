import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IPago } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private apiService: ApiService) {}

  getAll(): Observable<IPago[]> {
    return this.apiService.get<IPago[]>('/api/pagos').pipe(
      map(response => response.datos || [])
    );
  }

  getById(id: number): Observable<IPago> {
    return this.apiService.get<IPago>(`/api/pagos/${id}`).pipe(
      map(response => response.datos!)
    );
  }

  getByFactura(idFactura: number): Observable<IPago[]> {
    return this.apiService.get<IPago[]>(`/api/pagos/factura/${idFactura}`).pipe(
      map(response => response.datos || [])
    );
  }

  getConfirmed(): Observable<IPago[]> {
    return this.apiService.get<IPago[]>('/api/pagos/confirmados').pipe(
      map(response => response.datos || [])
    );
  }

  registrarPago(idFactura: number, monto: number, metodo: string, referencia?: string): Observable<string> {
    const params: any = { idFactura, monto, metodo };
    if (referencia) params.referencia = referencia;

    return this.apiService.postFormUrlEncoded<string>('/api/pagos', params).pipe(
      map(response => response.datos!)
    );
  }
}
