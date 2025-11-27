import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { ClientService } from '../../core/services/client.service';
import { ApiService } from '../../core/services/api.service';
import { NotificationService } from '../../core/services/notification.service';
import { forkJoin, of, catchError } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartOptions, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  // Main metrics
  citasHoy: number = 0;
  atencionesEnCurso: number = 0;
  ingresosDia: number = 0;
  totalClientes: number = 0;

  // Queue data
  colaData: any[] = [];

  // Monthly statistics
  estadisticasData: any = null;

  // Income data for chart
  ingresosData: any[] = [];

  isLoading = true;

  // ID de sucursal fijo por ahora (idealmente vendría del login)
  private readonly ID_SUCURSAL = 1;

  constructor(
    private dashboardService: DashboardService,
    private clientService: ClientService,
    private apiService: ApiService,
    private notificationService: NotificationService
  ) {}

  topClientes: any[] = [];

  // Chart.js configuration for income trend
  public incomeChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ingresos Diarios (S/)',
        fill: true,
        tension: 0.4,
        borderColor: '#f39c12',
        backgroundColor: 'rgba(243, 156, 18, 0.1)',
        pointBackgroundColor: '#f39c12',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#f39c12',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  public incomeChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return 'S/ ' + Number(context.parsed.y).toFixed(2);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return 'S/ ' + value;
          }
        }
      }
    }
  };

  ngOnInit() {
    this.loadAllData();
  }

  loadAllData() {
    this.isLoading = true;
    const today = new Date().toISOString().split('T')[0];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Calculate first day of month
    const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;

    forkJoin({
      metricas: this.dashboardService.getMetricas(today, today).pipe(
        catchError((error: any) => {
          console.error('Error cargando métricas:', error);
          return of(null);
        })
      ),
      cola: this.dashboardService.getCola(this.ID_SUCURSAL).pipe(
        catchError((error: any) => {
          console.warn('Error cargando cola:', error);
          return of([]);
        })
      ),
      estadisticas: this.dashboardService.getEstadisticasMensuales(currentYear, currentMonth).pipe(
        catchError((error: any) => {
          console.error('Error cargando estadísticas:', error);
          return of(null);
        })
      ),
      ingresos: this.dashboardService.getIngresosReporte(firstDayOfMonth, today, this.ID_SUCURSAL).pipe(
        catchError((error: any) => {
          console.error('Error cargando ingresos:', error);
          return of([]);
        })
      ),
      topClientes: this.dashboardService.getTopClientes().pipe(
        catchError((error: any) => {
          console.error('Error cargando top clientes:', error);
          return of([]);
        })
      )
    }).subscribe({
      next: (results) => {
        this.isLoading = false;
        console.log('✅ Dashboard Data:', results);

        // --- A. Procesar Métricas ---
        if (results.metricas) {
          const metricas: any = results.metricas;
          this.totalClientes = metricas.totalClientes || 0;
          this.citasHoy = metricas.citasHoy || 0;
          this.ingresosDia = Number(metricas.ingresosPeriodo || 0);
          this.atencionesEnCurso = metricas.atencionesEnCurso || 0;
        }

        // --- B. Procesar Cola ---
        if (Array.isArray(results.cola)) {
          this.colaData = results.cola.slice(0, 5); // Top 5
        }

        // --- C. Procesar Estadísticas Mensuales ---
        if (results.estadisticas && results.estadisticas.length > 0) {
          this.estadisticasData = results.estadisticas[0];
        }

        // --- D. Procesar Ingresos ---
        if (Array.isArray(results.ingresos)) {
          this.ingresosData = results.ingresos;

          // Update Chart.js data
          this.incomeChartData.labels = results.ingresos.map((d: any) => {
            const fecha = d.fecha || d.fechaReporte;
            if (fecha) {
              const date = new Date(fecha);
              return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
            }
            return '';
          });

          this.incomeChartData.datasets[0].data = results.ingresos.map((d: any) =>
            Number(d.total || d.totalIngresos || d.ingresos_totales || 0)
          );
        }

        // --- E. Top Clientes ---
        if (results.topClientes && Array.isArray(results.topClientes)) {
          this.topClientes = results.topClientes;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('❌ Error crítico cargando dashboard:', err);
        this.notificationService.error('Error crítico al cargar el dashboard.');
      }
    });
  }

  // Helper method for badge colors
  getEstadoBadgeClass(estado: string): string {
    const classes: any = {
      'en_espera': 'badge-warning',
      'en_servicio': 'badge-info',
      'pausado': 'badge-secondary'
    };
    return classes[estado] || 'badge-default';
  }

  // Calculate max value for bar charts
  getMaxEstadistica(): number {
    if (!this.estadisticasData) return 100;
    return Math.max(
      this.estadisticasData.total_facturado || 0,
      this.estadisticasData.clientes_nuevos || 0,
      this.estadisticasData.atenciones_realizadas || 0
    );
  }

  // Get percentage for bar charts
  getBarPercentage(value: number): number {
    const max = this.getMaxEstadistica();
    return max > 0 ? (value / max) * 100 : 0;
  }
}
