import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, ApiResponse } from '../../core/services/api.service';
import { IAtencion, IReporteIngresos } from '../../core/models/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  citasHoy: number = 0;
  atencionesEnCurso: number = 0;
  ingresosDia: number = 0;
  totalClientes: number = 0;

  isLoading = true;

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.isLoading = true;
    const today = new Date().toISOString().split('T')[0];

    // Usamos forkJoin para esperar a que todas las peticiones terminen
    // Importamos forkJoin de rxjs
    import('rxjs').then(({ forkJoin }) => {
      forkJoin({
        citas: this.apiService.get<any>('/dashboard/citas-hoy'),
        atenciones: this.apiService.get<IAtencion[]>('/atenciones', { estado: 'EN_PROCESO' }),
        ingresos: this.apiService.get<any[]>(`/reportes/ingresos?fechaInicio=${today}`),
        clientes: this.apiService.get<any[]>('/clientes')
      }).subscribe({
        next: (results) => {
          this.isLoading = false;

          // 1. Citas
          if (results.citas.exito) this.citasHoy = results.citas.datos;

          // 2. Atenciones
          if (results.atenciones.exito && results.atenciones.datos) {
            this.atencionesEnCurso = results.atenciones.datos.length;
          }

          // 3. Ingresos
          if (results.ingresos.exito && results.ingresos.datos) {
            this.ingresosDia = results.ingresos.datos.reduce((acc, item) => acc + (item[1] || 0), 0);
          }

          // 4. Clientes
          if (results.clientes.exito && results.clientes.datos) {
            this.totalClientes = results.clientes.datos.length;
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error loading dashboard stats', err);
          this.notificationService.error('Error al cargar estadísticas del dashboard');
        }
      });
    });
  }
}
