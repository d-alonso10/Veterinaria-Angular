import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, ApiResponse } from '../../../core/services/api.service';
import { Cliente } from '../../../core/models/client.model';
import { IMascota } from '../../../core/models/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-mascota-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './mascota-form.component.html',
  styleUrl: './mascota-form.component.css'
})
export class MascotaFormComponent implements OnInit {
  mascotaForm: FormGroup;
  isEditing = false;
  mascotaId: number | null = null;
  clientes: Cliente[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.mascotaForm = this.fb.group({
      nombre: ['', Validators.required],
      especie: ['', Validators.required],
      raza: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      idCliente: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadClientes();
    this.mascotaId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.mascotaId) {
      this.isEditing = true;
      this.loadMascota(this.mascotaId);
    }
  }

  loadClientes() {
    this.apiService.get<Cliente[]>('/clientes').subscribe({
      next: (response: ApiResponse<Cliente[]>) => {
        if (response.exito && response.datos) {
          this.clientes = response.datos;
        }
      }
    });
  }

  loadMascota(id: number) {
    this.isLoading = true;
    this.apiService.get<IMascota>(`/mascotas/${id}`).subscribe({
      next: (response: ApiResponse<IMascota>) => {
        this.isLoading = false;
        if (response.exito && response.datos) {
          const mascota = response.datos;
          this.mascotaForm.patchValue({
            nombre: mascota.nombre,
            especie: mascota.especie,
            raza: mascota.raza,
            fechaNacimiento: mascota.fechaNacimiento,
            idCliente: mascota.cliente?.idCliente || mascota.idCliente
          });
        }
      },
      error: () => {
        this.isLoading = false;
        this.notificationService.error('Error al cargar datos de la mascota');
        this.router.navigate(['/pets']);
      }
    });
  }

  onSubmit() {
    if (this.mascotaForm.valid) {
      this.isLoading = true;
      const mascotaData = this.mascotaForm.value;

      // Ensure idCliente is a number
      mascotaData.idCliente = Number(mascotaData.idCliente);

      // Construct payload expected by backend
      // Backend likely expects a Cliente object or just the ID depending on DTO
      // Assuming DTO has idCliente field or we send a partial Cliente object
      const payload = {
        ...mascotaData,
        cliente: { idCliente: mascotaData.idCliente }
      };

      if (this.isEditing && this.mascotaId) {
        this.apiService.put(`/mascotas/${this.mascotaId}`, payload).subscribe({
          next: (response: ApiResponse<any>) => {
            this.isLoading = false;
            if (response.exito) {
              this.notificationService.success('Mascota actualizada correctamente');
              this.router.navigate(['/pets']);
            } else {
              this.notificationService.error(response.mensaje || 'Error al actualizar mascota');
            }
          },
          error: () => {
            this.isLoading = false;
            this.notificationService.error('Error al actualizar mascota');
          }
        });
      } else {
        this.apiService.post('/mascotas', payload).subscribe({
          next: (response: ApiResponse<any>) => {
            this.isLoading = false;
            if (response.exito) {
              this.notificationService.success('Mascota creada correctamente');
              this.router.navigate(['/pets']);
            } else {
              this.notificationService.error(response.mensaje || 'Error al crear mascota');
            }
          },
          error: () => {
            this.isLoading = false;
            this.notificationService.error('Error al crear mascota');
          }
        });
      }
    } else {
      this.mascotaForm.markAllAsTouched();
    }
  }
}
