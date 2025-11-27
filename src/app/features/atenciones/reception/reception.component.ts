import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AttentionService } from '../../../core/services/attention.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ClientService } from '../../../core/services/client.service';
import { PetService } from '../../../core/services/pet.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ICita, IMascota } from '../../../core/models/models';
import { Cliente } from '../../../core/models/client.model';

@Component({
  selector: 'app-reception',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reception.component.html',
  styleUrl: './reception.component.css'
})
export class ReceptionComponent implements OnInit {
  searchForm: FormGroup;
  walkInForm: FormGroup;
  citas: ICita[] = [];
  clientes: Cliente[] = [];
  mascotas: IMascota[] = [];
  isLoading = false;
  activeTab = 'citas'; // 'citas' or 'walkin'

  constructor(
    private fb: FormBuilder,
    private attentionService: AttentionService,
    private appointmentService: AppointmentService,
    private clientService: ClientService,
    private petService: PetService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      dni: ['']
    });

    this.walkInForm = this.fb.group({
      idCliente: ['', Validators.required],
      idMascota: ['', Validators.required],
      idGroomer: [''], // Optional
      observaciones: ['']
    });
  }

  ngOnInit(): void {
    this.loadClientes();

    this.walkInForm.get('idCliente')?.valueChanges.subscribe(clientId => {
      if (clientId) {
        this.loadMascotas(clientId);
      } else {
        this.mascotas = [];
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  loadClientes() {
    this.clientService.getClients().subscribe({
      next: (data) => this.clientes = data
    });
  }

  loadMascotas(clientId: number) {
    this.petService.getPetsByClient(clientId).subscribe({
      next: (data) => this.mascotas = data
    });
  }

  searchCitas() {
    // Logic to search appointments by client DNI or just list today's appointments?
    // Instructions say: "Buscar Cita: GET /citas/cliente/{id}/proximas"
    // But first we need to find the client.
    // Let's assume we search client by DNI first, then get appointments.
    const dni = this.searchForm.get('dni')?.value;
    if (dni) {
      this.clientService.searchClients(dni).subscribe({
        next: (clients) => {
          if (clients.length > 0) {
            const client = clients[0];
            this.appointmentService.getProximasByClient(client.idCliente!).subscribe({
              next: (citas) => this.citas = citas,
              error: () => this.notificationService.error('Error al buscar citas')
            });
          } else {
            this.notificationService.warning('Cliente no encontrado');
            this.citas = [];
          }
        },
        error: () => this.notificationService.error('Error al buscar cliente')
      });
    }
  }

  checkIn(cita: ICita) {
    if (confirm('¿Iniciar atención para esta cita?')) {
      this.isLoading = true;
      const params = {
        idCita: cita.idCita,
        idSucursal: 1, // Hardcoded
        idGroomer: 1, // Default or select?
        prioridad: 'normal'
      };

      this.attentionService.createFromAppointment(params).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success('Atención iniciada');
          this.router.navigate(['/queue']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error starting attention', err);
          this.notificationService.error('Error al iniciar atención');
        }
      });
    }
  }

  startWalkIn() {
    if (this.walkInForm.valid) {
      this.isLoading = true;
      const formValue = this.walkInForm.value;
      const params = {
        idCliente: formValue.idCliente,
        idMascota: formValue.idMascota,
        idSucursal: 1,
        idGroomer: formValue.idGroomer || 1,
        observaciones: formValue.observaciones
      };

      this.attentionService.createWalkIn(params).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success('Atención Walk-In iniciada');
          this.router.navigate(['/queue']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error starting walk-in', err);
          this.notificationService.error('Error al iniciar atención');
        }
      });
    }
  }
}
