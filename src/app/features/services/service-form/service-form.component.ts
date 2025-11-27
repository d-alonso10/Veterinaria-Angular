import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServiceService } from '../../../core/services/service.service';
import { IServicio } from '../../../core/models/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.css'
})
export class ServiceFormComponent implements OnInit {
  serviceForm: FormGroup;
  isEditMode = false;
  serviceId: number | null = null;
  isLoading = false;

  categories = [
    { value: 'baño', label: 'Baño' },
    { value: 'corte', label: 'Corte de Pelo' },
    { value: 'peluqueria', label: 'Peluquería' },
    { value: 'spa', label: 'SPA' },
    { value: 'veterinaria', label: 'Veterinaria' },
    { value: 'otro', label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.serviceForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      codigo: [''],
      categoria: ['baño', Validators.required],
      precioBase: [0, [Validators.required, Validators.min(0)]],
      duracionEstimadaMin: [30, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.serviceId = Number(id);
      this.loadService(this.serviceId);
    }
  }

  loadService(id: number) {
    this.serviceService.getById(id).subscribe({
      next: (service) => {
        this.serviceForm.patchValue(service);
      },
      error: () => {
        this.notificationService.error('Error al cargar servicio');
        this.router.navigate(['/services']);
      }
    });
  }

  onSubmit() {
    if (this.serviceForm.valid) {
      this.isLoading = true;
      const serviceData: IServicio = this.serviceForm.value;

      const operation = this.isEditMode
        ? this.serviceService.update(this.serviceId!, serviceData)
        : this.serviceService.create(serviceData);

      operation.subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success(`Servicio ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`);
          this.router.navigate(['/services']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error saving service', err);
          this.notificationService.error(`Error al ${this.isEditMode ? 'actualizar' : 'crear'} servicio`);
        }
      });
    } else {
      this.serviceForm.markAllAsTouched();
    }
  }
}
