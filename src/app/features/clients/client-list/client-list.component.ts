import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
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
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes() {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (error) => {
        console.error('Error loading clients', error);
        this.notificationService.error('Error al cargar clientes');
      }
    });
  }

  deleteClient(id: number) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.notificationService.success('Cliente eliminado correctamente');
          this.loadClientes();
        },
        error: (error) => {
          console.error('Error deleting client', error);
          this.notificationService.error('Error al eliminar cliente');
        }
      });
    }
  }
}

