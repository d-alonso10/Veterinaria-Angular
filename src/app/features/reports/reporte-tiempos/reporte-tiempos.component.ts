import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ITiempoPromedio } from '../../../core/models/models';

@Component({
  selector: 'app-reporte-tiempos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reporte-tiempos.component.html',
  styleUrl: './reporte-tiempos.component.css'
})
export class ReporteTiemposComponent implements OnInit {
  tiempos: ITiempoPromedio[] = [];
  isLoading = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadTiempos();
  }

  loadTiempos() {
    this.isLoading = true;
    // The backend returns List<Object[]>, we need to map it manually if it's not a clean JSON object
    // Assuming the API returns a standard ApiResponse with datos as the list of objects
    this.apiService.get<any[]>('/api/groomers/tiempos-promedio').subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.exito && response.datos) {
          // Map Object[] to ITiempoPromedio
          // Assuming structure: [groomerName, averageTime, count]
          this.tiempos = response.datos.map((item: any[]) => ({
            groomer: item[0],
            cantidadAtenciones: item[1],
            tiempoPromedio: item[2]
          }));
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error loading report', err);
      }
    });
  }
}
