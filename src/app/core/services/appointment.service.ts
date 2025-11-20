import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { ICita } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.get<ICita[]>('/citas');
  }

  getByClient(clientId: number) {
    return this.api.get<ICita[]>(`/citas/cliente/${clientId}`);
  }

  create(cita: ICita) {
    return this.api.post('/citas', cita);
  }

  cancel(id: number) {
    return this.api.put(`/citas/${id}/cancelar`);
  }
}
