import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-clientes-frecuentes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './clientes-frecuentes.component.html',
  styleUrl: './clientes-frecuentes.component.css'
})
export class ClientesFrecuentesComponent implements OnInit {
  clientes: any[] = [];
  isLoading = false;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes() {
    this.isLoading = true;
    this.dashboardService.getTopClientes(10).subscribe({
      next: (data) => {
        this.isLoading = false;
        this.clientes = data;
        console.log('Clientes frecuentes:', data);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading top clients', error);
      }
    });
  }

  getInitials(nombre: string, apellido: string): string {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  }

  getTotalMascotas(): number {
    return this.clientes.reduce((sum, c) => sum + (c.total_mascotas || 0), 0);
  }

  getTotalAtenciones(): number {
    return this.clientes.reduce((sum, c) => sum + (c.total_atenciones || 0), 0);
  }

  getTotalGastado(): number {
    return this.clientes.reduce((sum, c) => sum + (Number(c.total_gastado) || 0), 0);
  }

  getProgressPercentage(atenciones: number): number {
    const max = Math.max(...this.clientes.map(c => c.total_atenciones || 0));
    return max > 0 ? (atenciones / max) * 100 : 0;
  }
}
