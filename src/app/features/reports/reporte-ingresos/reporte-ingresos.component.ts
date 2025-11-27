import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DashboardService } from '../../../core/services/dashboard.service';

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
    private dashboardService: DashboardService
  ) {
    const today = new Date().toISOString().split('T')[0];
    this.filterForm = this.fb.group({
      fechaInicio: [today, Validators.required],
      fechaFin: [today, Validators.required],
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

      this.dashboardService.getIngresos(fechaInicio, fechaFin, idSucursal).subscribe({
        next: (data) => {
          this.isLoading = false;
          this.ingresos = data;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error loading ingresos', error);
        }
      });
    }
  }

  getTotalIngresos(): number {
    return this.ingresos.reduce((sum, item) => sum + (item.total || 0), 0);
  }
}
