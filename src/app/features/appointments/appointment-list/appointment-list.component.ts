import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ICita } from '../../../core/models/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './appointment-list.component.html',
  styleUrl: './appointment-list.component.css'
})
export class AppointmentListComponent implements OnInit {
  citas: ICita[] = [];
  filteredCitas: ICita[] = [];
  searchTerm: string = '';

  // Modal state
  showRescheduleModal = false;
  selectedCita: ICita | null = null;
  newDate: string = '';
  newTime: string = '';

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCitas();
  }

  loadCitas() {
    this.appointmentService.getAll().subscribe({
      next: (data) => {
        console.log('Citas received:', data);
        this.citas = data;
        this.filteredCitas = data;
      },
      error: (error: any) => {
        console.error('Error loading appointments', error);
        this.notificationService.error('Error al cargar citas');
      }
    });
  }

  filterCitas() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.filteredCitas = this.citas;
      return;
    }

    this.filteredCitas = this.citas.filter(cita =>
      cita.nombreCliente?.toLowerCase().includes(term) ||
      cita.nombreMascota?.toLowerCase().includes(term) ||
      cita.nombreServicio?.toLowerCase().includes(term) ||
      cita.estado?.toLowerCase().includes(term) ||
      cita.modalidad?.toLowerCase().includes(term)
    );
  }

  getStatusLabel(estado: string): string {
    const labels: any = {
      'reservada': '⏳ Reservada',
      'confirmada': '✓ Confirmada',
      'asistio': '✓ Asistió',
      'atendido': '✅ Atendido',
      'cancelada': '✕ Cancelada',
      'no_show': '⚠ No Show'
    };
    return labels[estado] || estado;
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

  openRescheduleModal(cita: ICita) {
    this.selectedCita = cita;

    // Pre-fill with current date/time
    if (cita.fechaProgramada) {
      const fecha = new Date(cita.fechaProgramada);
      this.newDate = fecha.toISOString().split('T')[0]; // YYYY-MM-DD
      this.newTime = fecha.toTimeString().slice(0, 5); // HH:mm
    } else {
      this.newDate = '';
      this.newTime = '';
    }

    this.showRescheduleModal = true;
  }

  closeRescheduleModal() {
    this.showRescheduleModal = false;
    this.selectedCita = null;
    this.newDate = '';
    this.newTime = '';
  }

  saveReschedule() {
    if (!this.selectedCita || !this.newDate || !this.newTime) {
      this.notificationService.error('Por favor complete fecha y hora');
      return;
    }

    // Combinar fecha y hora en formato ISO
    const nuevaFecha = `${this.newDate}T${this.newTime}:00`;

    this.appointmentService.reschedule(this.selectedCita.idCita!, nuevaFecha).subscribe({
      next: () => {
        this.notificationService.success('Cita reprogramada exitosamente');
        this.closeRescheduleModal();
        this.loadCitas();
      },
      error: (error: any) => {
        console.error('Error rescheduling', error);
        this.notificationService.error('Error al reprogramar cita');
      }
    });
  }

  rescheduleCita(id: number) {
    const cita = this.citas.find(c => c.idCita === id);
    if (cita) {
      this.openRescheduleModal(cita);
    }
  }

  crearAtencion(idCita: number) {
    this.router.navigate(['/atenciones/nueva'], { queryParams: { idCita } });
  }
}
