import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GroomerService, IGroomer } from '../../../core/services/groomer.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-groomer-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './groomer-list.component.html',
  styleUrl: './groomer-list.component.css'
})
export class GroomerListComponent implements OnInit {
  groomers: IGroomer[] = [];
  filteredGroomers: IGroomer[] = [];
  isLoading = false;
  searchTerm: string = '';

  constructor(
    private groomerService: GroomerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadGroomers();
  }

  loadGroomers() {
    this.isLoading = true;
    this.groomerService.getAll().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.groomers = data;
        this.filteredGroomers = data;
        console.log('Groomers loaded:', data);
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error loading groomers', error);
        this.notificationService.error('Error al cargar groomers');
      }
    });
  }

  filterGroomers() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredGroomers = this.groomers;
      return;
    }

    this.filteredGroomers = this.groomers.filter(groomer =>
      groomer.nombre?.toLowerCase().includes(term) ||
      groomer.especialidades?.toLowerCase().includes(term)
    );
  }

  getInitials(nombre: string): string {
    const parts = nombre.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  getSpecialtiesArray(especialidades: string): string[] {
    try {
      const parsed = JSON.parse(especialidades);

      // Formato nuevo: {"principales":["corte","baño"],"adicionales":["spa"]}
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const principales = parsed.principales || [];
        const adicionales = parsed.adicionales || [];
        return [...principales, ...adicionales];
      }

      // Formato antiguo: ["Especialidad 1", "Especialidad 2"]
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return especialidades ? [especialidades] : [];
    }
  }

  getAvailabilityArray(disponibilidad: string): string[] {
    try {
      const parsed = JSON.parse(disponibilidad);
      if (typeof parsed === 'object' && parsed !== null) {
        return Object.keys(parsed);
      }
      return [];
    } catch {
      return [];
    }
  }

  deleteGroomer(id: number) {
    if (confirm('¿Está seguro de eliminar este groomer?')) {
      this.groomerService.delete(id).subscribe({
        next: () => {
          this.notificationService.success('Groomer eliminado correctamente');
          this.loadGroomers();
        },
        error: () => this.notificationService.error('Error al eliminar groomer')
      });
    }
  }

  parseEspecialidades(especialidades: string): string {
    try {
      const arr = JSON.parse(especialidades);
      return Array.isArray(arr) ? arr.join(', ') : especialidades;
    } catch {
      return especialidades;
    }
  }

  parseDisponibilidad(disponibilidad: string): string {
    try {
      const obj = JSON.parse(disponibilidad);
      return Object.entries(obj).map(([dia, horario]) => `${dia}: ${horario}`).join(', ');
    } catch {
      return disponibilidad;
    }
  }
}
