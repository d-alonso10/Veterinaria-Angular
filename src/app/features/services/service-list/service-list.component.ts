import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../../core/services/service.service';
import { IServicio } from '../../../core/models/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.css'
})
export class ServiceListComponent implements OnInit {
  services: IServicio[] = [];
  filteredServices: IServicio[] = [];
  isLoading = false;
  searchTerm: string = '';

  constructor(
    private serviceService: ServiceService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices() {
    this.isLoading = true;
    console.log('Loading services from /api/servicios...');
    this.serviceService.getServices().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.services = data;
        this.filteredServices = data;
        console.log('Services loaded:', data);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error loading services', error);
        this.notificationService.error('Error al cargar servicios');
      }
    });
  }

  filterServices() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredServices = this.services;
      return;
    }

    this.filteredServices = this.services.filter(service =>
      service.nombre?.toLowerCase().includes(term) ||
      service.categoria?.toLowerCase().includes(term) ||
      service.codigo?.toLowerCase().includes(term) ||
      service.descripcion?.toLowerCase().includes(term)
    );
  }

  getCategoryIcon(categoria: string): string {
    const icons: any = {
      'baño': '🛁',
      'corte': '✂️',
      'estetica': '💅',
      'spa': '🌸',
      'veterinaria': '🏥',
      'otro': '🔧'
    };
    return icons[categoria] || '✂️';
  }

  getCategoryLabel(categoria: string): string {
    const labels: any = {
      'baño': 'Baño',
      'corte': 'Corte',
      'estetica': 'Estética',
      'spa': 'Spa',
      'veterinaria': 'Veterinaria',
      'otro': 'Otro'
    };
    return labels[categoria] || categoria;
  }

  deleteService(id: number) {
    if (confirm('¿Está seguro de eliminar este servicio?')) {
      this.serviceService.delete(id).subscribe({
        next: () => {
          this.notificationService.success('Servicio eliminado correctamente');
          this.loadServices();
        },
        error: () => this.notificationService.error('Error al eliminar servicio')
      });
    }
  }
}
