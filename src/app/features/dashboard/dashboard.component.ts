import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { ClientService } from '../../core/services/client.service';
import { ApiService } from '../../core/services/api.service'; // Still needed for cola if not moved yet, or move cola to AttentionService
import { NotificationService } from '../../core/services/notification.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  citasHoy: number = 0;
  atencionesEnCurso: number = 0;
  ingresosDia: number = 0;
  totalClientes: number = 0;

  isLoading = true;

  // ID de sucursal fijo por ahora (idealmente vendría del login)
  private readonly ID_SUCURSAL = 1;

  constructor(
    private dashboardService: DashboardService,
    private clientService: ClientService,
    private apiService: ApiService, // Keeping for cola if no service yet. Ideally should be AttentionService.
    private notificationService: NotificationService
  ) {}

  topClientes: any[] = [];

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    const today = new Date().toISOString().split('T')[0];

    forkJoin({
      metricas: this.dashboardService.getMetricas(today, today),
      cola: this.apiService.get<any[]>(`/atenciones/cola/${this.ID_SUCURSAL}`), // TODO: Move to AttentionService
      ingresos: this.dashboardService.getIngresos(today, today, this.ID_SUCURSAL),
      clientes: this.clientService.getClients(),
      topClientes: this.dashboardService.getTopClientes()
    }).subscribe({
      next: (results) => {
        this.isLoading = false;

        // --- A. Procesar Citas del Día ---
        if (results.metricas && results.metricas.length > 0) {
          const data = results.metricas[0];
          this.citasHoy = data['citas_hoy'] || 0;
        }

        // --- B. Procesar Atenciones en Curso ---
        const colaResponse = results.cola as any; // ApiResponse
        if (colaResponse.exito && colaResponse.datos) {
          this.atencionesEnCurso = colaResponse.datos.length;
        }

        // --- C. Procesar Ingresos ---
        if (results.ingresos) {
          this.ingresosDia = results.ingresos.reduce((acc: number, item: any) => {
            const valor = item.ingresos_totales || item.total || 0;
            return acc + Number(valor);
          }, 0);
        }

        // --- D. Procesar Total de Clientes ---
        if (results.clientes) {
          this.totalClientes = results.clientes.length;
        }

        // --- E. Top Clientes ---
        if (results.topClientes) {
          this.topClientes = results.topClientes;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error cargando dashboard:', err);
        this.notificationService.error('No se pudieron cargar algunos datos del tablero.');
      }
    });
  }
}

