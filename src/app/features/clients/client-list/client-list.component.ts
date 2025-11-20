import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, ApiResponse } from '../../../core/services/api.service';
import { Cliente } from '../../../core/models/client.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  clientes: Cliente[] = [];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes() {
    this.apiService.get<Cliente[]>('/clientes').subscribe({
      next: (response: ApiResponse<Cliente[]>) => {
        if (response.exito && response.datos) {
          this.clientes = response.datos;
        }
      },
      error: (error: any) => {
        console.error('Error loading clients', error);
        // Mock data for demonstration if API fails
        this.clientes = [
          { idCliente: 1, nombre: 'Juan', apellido: 'Perez', dniRuc: '12345678', email: 'juan@example.com', telefono: '999888777', direccion: 'Av. Siempre Viva 123' },
          { idCliente: 2, nombre: 'Maria', apellido: 'Gomez', dniRuc: '87654321', email: 'maria@example.com', telefono: '999111222', direccion: 'Calle Falsa 123' }
        ];
      }
    });
  }

  deleteClient(id: number) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.apiService.delete(`/clientes/${id}`).subscribe({
        next: (response) => {
          if (response.exito) {
            this.notificationService.success('Cliente eliminado correctamente');
            this.loadClientes();
          } else {
            this.notificationService.error(response.mensaje || 'Error al eliminar cliente');
          }
        },
        error: () => {
          this.notificationService.error('Error al eliminar cliente');
        }
      });
    }
  }
}
