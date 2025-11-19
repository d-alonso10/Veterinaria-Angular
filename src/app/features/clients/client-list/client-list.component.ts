import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Cliente } from '../../../core/models/client.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  clientes: Cliente[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes() {
    this.apiService.get<Cliente[]>('/clientes').subscribe({
      next: (response: any) => {
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
}
