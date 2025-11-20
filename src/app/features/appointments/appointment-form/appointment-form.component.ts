import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ClientService } from '../../../core/services/client.service';
import { PetService } from '../../../core/services/pet.service';
import { ServiceService } from '../../../core/services/service.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Cliente } from '../../../core/models/client.model';
import { IMascota, IServicio, ICita } from '../../../core/models/models';

@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './appointment-form.component.html',
  styleUrl: './appointment-form.component.css'
})
export class AppointmentFormComponent implements OnInit {
  appointmentForm: FormGroup;
  clientes: Cliente[] = [];
  mascotas: IMascota[] = [];
  servicios: IServicio[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private clientService: ClientService,
    private petService: PetService,
    private serviceService: ServiceService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.appointmentForm = this.fb.group({
      idCliente: ['', Validators.required],
      idMascota: [{ value: '', disabled: true }, Validators.required],
      idServicio: ['', Validators.required],
      fechaProgramada: ['', Validators.required],
      modalidad: ['presencial', Validators.required],
      notas: ['']
    });
  }

  ngOnInit(): void {
    this.loadClientes();
    this.loadServicios();

    this.appointmentForm.get('idCliente')?.valueChanges.subscribe(clientId => {
      if (clientId) {
        this.loadMascotas(clientId);
        this.appointmentForm.get('idMascota')?.enable();
      } else {
        this.mascotas = [];
        this.appointmentForm.get('idMascota')?.disable();
        this.appointmentForm.get('idMascota')?.setValue('');
      }
    });
  }

  loadClientes() {
    this.clientService.getClients().subscribe({
      next: (data) => this.clientes = data,
      error: () => this.notificationService.error('Error al cargar clientes')
    });
  }

  loadServicios() {
    this.serviceService.getServices().subscribe({
      next: (data) => this.servicios = data,
      error: () => this.notificationService.error('Error al cargar servicios')
    });
  }

  loadMascotas(clientId: number) {
    this.petService.getPetsByClient(clientId).subscribe({
      next: (data) => this.mascotas = data,
      error: () => this.notificationService.error('Error al cargar mascotas del cliente')
    });
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      this.isLoading = true;
      const formValue = this.appointmentForm.value;

      // Ensure idSucursal is set (hardcoded to 1 for now as per instructions/dashboard)
      let fecha = formValue.fechaProgramada;
      if (fecha && fecha.length === 16) {
          fecha = fecha + ':00';
      }

      const cita: ICita = {
        idCliente: Number(formValue.idCliente),
        idMascota: Number(formValue.idMascota),
        idServicio: Number(formValue.idServicio),
        idSucursal: 1,
        fechaProgramada: fecha,
        modalidad: formValue.modalidad,
        notas: formValue.notas
      };

      this.appointmentService.create(cita).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success('Cita programada correctamente');
          this.router.navigate(['/appointments']);
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error creating appointment', err);
          this.notificationService.error('Error al programar cita');
        }
      });
    } else {
      this.appointmentForm.markAllAsTouched();
    }
  }
}
