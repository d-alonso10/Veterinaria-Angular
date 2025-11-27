import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PetService } from '../../../core/services/pet.service';
import { ClientService } from '../../../core/services/client.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { IMascota, ICliente } from '../../../core/models/models';
import { NotificationService } from '../../../core/services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-mascota-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mascota-list.component.html',
  styleUrl: './mascota-list.component.css'
})
export class MascotaListComponent implements OnInit {
  mascotas: IMascota[] = [];
  filteredMascotas: IMascota[] = [];
  clientes: ICliente[] = [];
  searchTerm: string = '';

  showHistoryModal = false;
  selectedPetHistory: any[] = [];
  selectedPetName = '';
  loadingHistory = false;

  constructor(
    private petService: PetService,
    private clientService: ClientService,
    private dashboardService: DashboardService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    // Cargar mascotas y clientes en paralelo
    forkJoin({
      mascotas: this.petService.getPets(),
      clientes: this.clientService.getClients()
    }).subscribe({
      next: (result) => {
        this.clientes = result.clientes;

        // Mapear clientes a mascotas
        this.mascotas = result.mascotas.map(mascota => {
          const cliente = this.clientes.find(c => c.idCliente === mascota.idCliente);
          return {
            ...mascota,
            cliente: cliente as any
          };
        });

        this.filteredMascotas = this.mascotas;
        console.log('Mascotas con clientes:', this.mascotas);
      },
      error: (error: any) => {
        console.error('Error loading data', error);
        this.notificationService.error('Error al cargar datos');
      }
    });
  }

  loadMascotas() {
    this.loadData();
  }

  filterMascotas() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredMascotas = this.mascotas;
      return;
    }

    this.filteredMascotas = this.mascotas.filter(mascota =>
      mascota.nombre?.toLowerCase().includes(term) ||
      mascota.raza?.toLowerCase().includes(term) ||
      mascota.especie?.toLowerCase().includes(term) ||
      mascota.cliente?.nombre?.toLowerCase().includes(term) ||
      mascota.cliente?.apellido?.toLowerCase().includes(term)
    );
  }

  getSpeciesIcon(especie: string): string {
    const icons: any = {
      'perro': '🐕',
      'gato': '🐈',
      'otro': '🐾'
    };
    return icons[especie] || '🐾';
  }

  getSexIcon(sexo: string): string {
    const icons: any = {
      'macho': '♂️',
      'hembra': '♀️',
      'otro': '⚪'
    };
    return icons[sexo] || '⚪';
  }

  getAge(fechaNacimiento: string): string {
    if (!fechaNacimiento) return 'N/A';

    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    const diffMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 +
                       (today.getMonth() - birthDate.getMonth());

    if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
    }

    const years = Math.floor(diffMonths / 12);
    return `${years} ${years === 1 ? 'año' : 'años'}`;
  }

  getInitials(nombre: string, apellido: string): string {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  }

  viewHistory(mascota: IMascota) {
    this.selectedPetName = mascota.nombre || '';
    this.showHistoryModal = true;
    this.loadingHistory = true;
    this.selectedPetHistory = [];

    this.dashboardService.getHistorialMascota(mascota.idMascota!).subscribe({
      next: (history) => {
        this.loadingHistory = false;
        this.selectedPetHistory = history;
        console.log('Historia de mascota:', history);
      },
      error: (error: any) => {
        this.loadingHistory = false;
        console.error('Error loading pet history', error);
        this.notificationService.error('Error al cargar historial de la mascota');
      }
    });
  }

  closeHistoryModal() {
    this.showHistoryModal = false;
    this.selectedPetHistory = [];
    this.selectedPetName = '';
  }

  calculateDuration(inicio: string, fin: string): string {
    const start = new Date(inicio);
    const end = new Date(fin);
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}min`;
    }
    return `${diffMins} min`;
  }

  getTotalSpent(): number {
    return this.selectedPetHistory.reduce((total, item) => {
      return total + (Number(item.monto_facturado) || 0);
    }, 0);
  }

  deleteMascota(id: number) {
    if (confirm('¿Está seguro de eliminar esta mascota?')) {
      this.petService.deletePet(id).subscribe({
        next: () => {
          this.notificationService.success('Mascota eliminada correctamente');
          this.loadMascotas();
        },
        error: (error: any) => {
          console.error('Error deleting pet', error);
          this.notificationService.error('Error al eliminar mascota');
        }
      });
    }
  }
}
