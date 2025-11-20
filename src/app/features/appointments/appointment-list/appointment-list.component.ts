import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ICita } from '../../../core/models/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent implements OnInit {
  citas: ICita[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCitas();
  }

  loadCitas() {
    this.appointmentService.getAll().subscribe({
      next: (data) => {
        this.citas = data;
      },
      error: (error) => {
        console.error('Error loading appointments', error);
        this.notificationService.error('Error al cargar citas');
      }
    });
  }

  confirmCita(id: number) {
    this.appointmentService.confirm(id).subscribe({
      next: () => {
        this.notificationService.success('Cita confirmada');
        this.loadCitas();
      },
      error: () => this.notificationService.error('Error al confirmar cita')
    });
  }

  cancelCita(id: number) {
    if (confirm('¿Está seguro de cancelar esta cita?')) {
      this.appointmentService.cancel(id).subscribe({
        next: () => {
          this.notificationService.success('Cita cancelada');
          this.loadCitas();
        },
        error: () => this.notificationService.error('Error al cancelar cita')
      });
    }
  }

  rescheduleCita(id: number) {
    const nuevaFecha = prompt('Ingrese la nueva fecha y hora (YYYY-MM-DDTHH:mm:ss):');
    if (nuevaFecha) {
      // Basic validation could go here
      this.appointmentService.reschedule(id, nuevaFecha).subscribe({
        next: () => {
          this.notificationService.success('Cita reprogramada');
          this.loadCitas();
        },
        error: () => this.notificationService.error('Error al reprogramar cita')
      });
    }
  }
}
