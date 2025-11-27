import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PetService } from '../../../core/services/pet.service';
import { ClientService } from '../../../core/services/client.service';
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
    private petService: PetService,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.mascotaForm = this.fb.group({
      nombre: ['', Validators.required],
      especie: ['', Validators.required],
      raza: ['', Validators.required],
      sexo: ['', Validators.required],
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
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (error: any) => {
        console.error('Error loading clients', error);
        this.notificationService.error('Error al cargar clientes');
      }
    });
  }

  loadMascota(id: number) {
    this.isLoading = true;
    this.petService.getPetById(id).subscribe({
      next: (mascota) => {
        this.isLoading = false;
        this.mascotaForm.patchValue({
          nombre: mascota.nombre,
          especie: mascota.especie,
          raza: mascota.raza,
          sexo: mascota.sexo,
          fechaNacimiento: mascota.fechaNacimiento,
          idCliente: mascota.cliente?.idCliente || mascota.idCliente
        });
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
      const formValue = this.mascotaForm.value;

      const payload: IMascota = {
        idCliente: Number(formValue.idCliente),
        nombre: formValue.nombre,
        especie: formValue.especie,
        raza: formValue.raza,
        sexo: formValue.sexo,
        fechaNacimiento: formValue.fechaNacimiento
      };

      if (this.isEditing && this.mascotaId) {
        this.petService.updatePet(this.mascotaId, payload).subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.success('Mascota actualizada correctamente');
            this.router.navigate(['/pets']);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error updating pet', err);
            this.notificationService.error('Error al actualizar mascota');
          }
        });
      } else {
        this.petService.createPet(payload).subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.success('Mascota creada correctamente');
            this.router.navigate(['/pets']);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Error creating pet', err);
            this.notificationService.error('Error al crear mascota');
          }
        });
      }
    } else {
      this.mascotaForm.markAllAsTouched();
    }
  }
}

