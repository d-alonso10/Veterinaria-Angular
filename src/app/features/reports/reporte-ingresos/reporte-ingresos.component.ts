import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-reporte-ingresos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reporte-ingresos.component.html',
  styleUrl: './reporte-ingresos.component.css'
})
export class ReporteIngresosComponent implements OnInit {
  filterForm: FormGroup;
  ingresos: any[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private reportService: ReportService
  ) {
    // Inicializar con el mes actual
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.filterForm = this.fb.group({
      fechaInicio: [firstDay.toISOString().split('T')[0], Validators.required],
      fechaFin: [lastDay.toISOString().split('T')[0], Validators.required],
      idSucursal: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadIngresos();
  }

  loadIngresos() {
    if (this.filterForm.valid) {
      this.isLoading = true;
      const { fechaInicio, fechaFin, idSucursal } = this.filterForm.value;

      this.reportService.getIngresos(fechaInicio, fechaFin, idSucursal).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.ingresos = data;
          console.log('📊 Ingresos cargados:', data);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading ingresos', error);
        }
      });
    }
  }

  // Métodos helper según estructura REAL del backend
  // Backend retorna: ingresos_totales, cantidad_facturas, promedio_por_factura
  getTotalFacturado(): number {
    return this.ingresos.reduce((sum, item) => sum + (item.ingresos_totales || 0), 0);
  }

  getTotalFacturas(): number {
    return this.ingresos.reduce((sum, item) => sum + (item.cantidad_facturas || 0), 0);
  }

  getPromedioGeneral(): number {
    const total = this.getTotalFacturado();
    const cantidad = this.getTotalFacturas();
    return cantidad > 0 ? total / cantidad : 0;
  }
}
