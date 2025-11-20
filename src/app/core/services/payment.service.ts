import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { IPago } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private apiService: ApiService) { }

  registrarPago(pago: IPago): Observable<IPago> {
    return this.apiService.post<IPago>('/pagos', pago).pipe(
      map(response => response.datos!)
    );
  }
}
