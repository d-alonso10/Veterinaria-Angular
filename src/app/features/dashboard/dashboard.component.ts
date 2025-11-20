import { Component, OnInit } from '@angular/core'; // Agrega OnInit
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { forkJoin } from 'rxjs'; // Importar directamente

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

  // ID de Sucursal por defecto (esto podría venir del usuario logueado en el futuro)
  private readonly ID_SUCURSAL = 1;

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

    // 1. Preparamos las peticiones a endpoints REALES de tu backend
    const requests = {
      // Usamos el endpoint general de métricas (Backend: DashboardController /metricas)
      metricas: this.apiService.get<any[]>(`/dashboard/metricas?fechaInicio=${today}&fechaFin=${today}`),

      // Usamos la cola de la sucursal para saber cuántos están en curso (Backend: AtencionController /cola/{id})
      cola: this.apiService.get<any[]>(`/atenciones/cola/${this.ID_SUCURSAL}`),

      // Reporte de ingresos con TODOS los params obligatorios (Backend: ReporteController /ingresos)
      ingresos: this.apiService.get<any[]>(`/reportes/ingresos?fechaInicio=${today}&fechaFin=${today}&idSucursal=${this.ID_SUCURSAL}`),

      // Total de clientes (Backend: ClienteController /clientes)
      clientes: this.apiService.get<any[]>('/clientes')
    };

    forkJoin(requests).subscribe({
      next: (results) => {
        this.isLoading = false;

        // A. Procesar Métricas Generales (Citas)
        // Tu SP devuelve una lista de mapas. Asumimos que 'citas_hoy' viene ahí.
        if (results.metricas.exito && results.metricas.datos && results.metricas.datos.length > 0) {
            // El SP devuelve varios result sets, tomamos el valor que corresponda.
            // Si el SP devuelve filas separadas, buscamos la que tenga la métrica.
            // Por seguridad, si el backend devuelve una estructura compleja, accedemos con seguridad.
            const data = results.metricas.datos[0];
            // Si el backend devuelve un objeto tipo { citas_hoy: 5 }, lo usamos.
            // Si devuelve un array posicional, tendrías que ajustar el índice.
            this.citasHoy = data['citas_hoy'] || data['citasHoy'] || 0;
        }

        // B. Procesar Cola (Atenciones en curso)
        if (results.cola.exito && results.cola.datos) {
          this.atencionesEnCurso = results.cola.datos.length;
        }

        // C. Procesar Ingresos
        if (results.ingresos.exito && results.ingresos.datos) {
          // El reporte de ingresos suele devolver filas agrupadas por fecha.
          // Sumamos el total de 'ingresos_totales' o 'total'.
          this.ingresosDia = results.ingresos.datos.reduce((acc: number, item: any) => {
            // Verificamos si viene como objeto (item.total) o array (item[1])
            const valor = item.ingresos_totales || item.total || 0;
            return acc + Number(valor);
          }, 0);
        }

        // D. Procesar Clientes
        if (results.clientes.exito && results.clientes.datos) {
          this.totalClientes = results.clientes.datos.length;
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error loading dashboard stats', err);
        // No mostramos error en UI para no bloquear la vista si falla una sola métrica
      }
    });
  }
}
