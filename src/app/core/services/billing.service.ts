import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IFactura } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private apiService: ApiService) { }

  createFactura(factura: IFactura): Observable<IFactura> {
    return this.apiService.post<IFactura>('/facturas', factura).pipe(
      map(response => response.datos!)
    );
  }

  getFacturasByCliente(clienteId: number): Observable<IFactura[]> {
    return this.apiService.get<IFactura[]>(`/facturas/cliente/${clienteId}`).pipe(
      map(response => response.datos || [])
    );
  }
}
