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

  constructor(
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    // 1. Citas del Día (Mocked endpoint or real if exists)
    // Assuming GET /api/dashboard/citas-hoy returns a count or list
    this.apiService.get<any>('/dashboard/citas-hoy').subscribe({
      next: (res: ApiResponse<any>) => {
        if (res.exito) this.citasHoy = res.datos;
      },
      error: () => this.citasHoy = 0 // Fail silently or show error
    });

    // 2. Atenciones en Curso
    this.apiService.get<IAtencion[]>('/atenciones', { estado: 'EN_PROCESO' }).subscribe({
      next: (res: ApiResponse<IAtencion[]>) => {
        if (res.exito && res.datos) {
          this.atencionesEnCurso = res.datos.length;
        }
      }
    });

    // 3. Ingresos del Día
    const today = new Date().toISOString().split('T')[0];
    this.apiService.get<any[]>(`/reportes/ingresos?fechaInicio=${today}`).subscribe({
      next: (res: ApiResponse<any[]>) => {
        if (res.exito && res.datos) {
          // Mapeo manual: Backend devuelve List<Object[]> -> [ ["2023-11-20", 500.00] ]
          // Asumimos que si filtramos por hoy, solo viene un registro o varios que debemos sumar
          const total = res.datos.reduce((acc, item) => acc + (item[1] || 0), 0);
          this.ingresosDia = total;
        }
      }
    });

    // 4. Total Clientes
    this.apiService.get<any[]>('/clientes').subscribe({
      next: (res: ApiResponse<any[]>) => {
        if (res.exito && res.datos) {
          this.totalClientes = res.datos.length;
        }
      }
    });
  }
}
