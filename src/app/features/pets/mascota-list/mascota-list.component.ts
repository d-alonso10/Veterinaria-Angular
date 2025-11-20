import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, ApiResponse } from '../../../core/services/api.service';
import { IMascota } from '../../../core/models/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-mascota-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mascota-list.component.html',
  styleUrl: './mascota-list.component.css'
})
export class MascotaListComponent implements OnInit {
  mascotas: IMascota[] = [];

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadMascotas();
  }

  loadMascotas() {
    this.apiService.get<IMascota[]>('/mascotas').subscribe({
      next: (response: ApiResponse<IMascota[]>) => {
        if (response.exito && response.datos) {
          this.mascotas = response.datos;
        }
      },
      error: (error: any) => {
        console.error('Error loading pets', error);
        this.notificationService.error('Error al cargar mascotas');
      }
    });
  }

  deleteMascota(id: number) {
    if (confirm('¿Está seguro de eliminar esta mascota?')) {
      this.apiService.delete(`/mascotas/${id}`).subscribe({
        next: (response) => {
          if (response.exito) {
            this.notificationService.success('Mascota eliminada correctamente');
            this.loadMascotas();
          } else {
            this.notificationService.error(response.mensaje || 'Error al eliminar mascota');
          }
        },
        error: () => {
          this.notificationService.error('Error al eliminar mascota');
        }
      });
    }
  }
}
