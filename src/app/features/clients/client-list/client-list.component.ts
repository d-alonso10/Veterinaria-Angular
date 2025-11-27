import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { ICliente } from '../../../core/models/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  clientes: ICliente[] = [];
  filteredClientes: ICliente[] = [];
  searchTerm: string = '';

  // Modal state
  showAppointmentsModal = false;
  selectedClientAppointments: any[] = [];
  selectedClientName = '';
  loadingAppointments = false;

  constructor(
    private clientService: ClientService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes() {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clientes = data;
        this.filteredClientes = data;
      },
      error: (error: any) => {
        console.error('Error loading clients', error);
        this.notificationService.error('Error al cargar clientes');
      }
    });
  }

  filterClients() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredClientes = this.clientes;
      return;
    }

    this.filteredClientes = this.clientes.filter(cliente =>
      cliente.nombre?.toLowerCase().includes(term) ||
      cliente.apellido?.toLowerCase().includes(term) ||
      cliente.email?.toLowerCase().includes(term) ||
      cliente.dniRuc?.toLowerCase().includes(term) ||
      cliente.telefono?.toLowerCase().includes(term)
    );
  }

  getInitials(nombre: string, apellido: string): string {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  }

  viewAppointments(cliente: ICliente) {
    this.selectedClientName = `${cliente.nombre} ${cliente.apellido}`;
    this.showAppointmentsModal = true;
    this.loadingAppointments = true;
    this.selectedClientAppointments = [];

    this.dashboardService.getProximasCitas(cliente.idCliente!).subscribe({
      next: (appointments) => {
        this.loadingAppointments = false;
        this.selectedClientAppointments = appointments;
        console.log('Próximas citas:', appointments);
      },
      error: (error: any) => {
        this.loadingAppointments = false;
        console.error('Error loading appointments', error);
        this.notificationService.error('Error al cargar próximas citas');
      }
    });
  }

  closeAppointmentsModal() {
    this.showAppointmentsModal = false;
    this.selectedClientAppointments = [];
    this.selectedClientName = '';
  }

  getEstadoBadgeClass(estado: string): string {
    const classes: any = {
      'reservada': 'badge-warning',
      'confirmada': 'badge-success',
      'asistio': 'badge-info',
      'cancelada': 'badge-danger',
      'no_show': 'badge-secondary'
    };
    return classes[estado] || 'badge-default';
  }

  deleteClient(id: number) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.notificationService.success('Cliente eliminado correctamente');
          this.loadClientes();
        },
        error: (error: any) => {
          console.error('Error deleting client', error);
          this.notificationService.error('Error al eliminar cliente');
        }
      });
    }
  }
}
