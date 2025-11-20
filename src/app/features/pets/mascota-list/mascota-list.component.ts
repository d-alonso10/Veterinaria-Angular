import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PetService } from '../../../core/services/pet.service';
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
    private petService: PetService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadMascotas();
  }

  loadMascotas() {
    this.petService.getPets().subscribe({
      next: (data) => {
        this.mascotas = data;
      },
      error: (error) => {
        console.error('Error loading pets', error);
        this.notificationService.error('Error al cargar mascotas');
      }
    });
  }

  deleteMascota(id: number) {
    if (confirm('¿Está seguro de eliminar esta mascota?')) {
      this.petService.deletePet(id).subscribe({
        next: () => {
          this.notificationService.success('Mascota eliminada correctamente');
          this.loadMascotas();
        },
        error: (error) => {
          console.error('Error deleting pet', error);
          this.notificationService.error('Error al eliminar mascota');
        }
      });
    }
  }
}

