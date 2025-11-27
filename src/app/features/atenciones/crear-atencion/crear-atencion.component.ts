import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { timer, of } from 'rxjs';
import { switchMap, map, filter, take } from 'rxjs/operators';
import { AttentionService } from '../../../core/services/attention.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { GroomerService } from '../../../core/services/groomer.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-crear-atencion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-atencion.component.html',
  styleUrl: './crear-atencion.component.css'
})
export class CrearAtencionComponent implements OnInit {
  atencionForm: FormGroup;
  isLoading = signal(false);
  isProcessing = signal(false);
  showLoadingOverlay = signal(false);
  loadingMessage = signal('Creando atención...');

  citasDisponibles = signal<any[]>([]);
  groomersDisponibles = signal<any[]>([]);
  citaSeleccionada = signal<any>(null);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private attentionService: AttentionService,
    private appointmentService: AppointmentService,
    private groomerService: GroomerService,
    private notificationService: NotificationService
  ) {
    this.atencionForm = this.fb.group({
      idCita: ['', Validators.required],
      idGroomer: ['', Validators.required],
      idSucursal: [1, Validators.required],
      turnoNum: [Math.floor(Math.random() * 1000), Validators.required],
      prioridad: [3, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  ngOnInit() {
    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading.set(true);

    // Cargar groomers
    this.groomerService.getAll().subscribe({
      next: (groomers: any) => {
        this.groomersDisponibles.set(groomers);
      },
      error: (error: any) => console.error('Error loading groomers', error)
    });

    // Cargar citas disponibles
    this.appointmentService.getAll().subscribe({
      next: (citas: any) => {
        const citasDisponibles = citas.filter((c: any) =>
          c.estado === 'reservada' || c.estado === 'confirmada'
        );
        this.citasDisponibles.set(citasDisponibles);
        this.isLoading.set(false);

        // Auto-seleccionar si viene por URL
        const idCitaParam = this.route.snapshot.queryParamMap.get('idCita');
        if (idCitaParam) {
          const idCita = Number(idCitaParam);
          const cita = citasDisponibles.find((c: any) => c.idCita === idCita);
          if (cita) {
            this.atencionForm.patchValue({ idCita: idCita });
            this.onCitaChange({ target: { value: idCita } });
          }
        }
      },
      error: (error: any) => {
        console.error('Error loading citas', error);
        this.isLoading.set(false);
      }
    });
  }

  onCitaChange(event: any) {
    const idCita = Number(event.target.value);
    const cita = this.citasDisponibles().find((c: any) => c.idCita === idCita);

    if (cita) {
      this.citaSeleccionada.set(cita);
      // Pre-llenar groomer si lo tiene
      if (cita.groomer?.idGroomer) {
        this.atencionForm.patchValue({
          idGroomer: cita.groomer.idGroomer
        });
      }
    }
  }

  onSubmit() {
    if (!this.atencionForm.valid) {
      this.notificationService.error('Por favor completa todos los campos requeridos');
      return;
    }

    const formValue = this.atencionForm.value;
    const now = new Date();
    const endTime = new Date(now.getTime() + 90 * 60000); // 1.5 horas después

    const params = {
      idCita: formValue.idCita,
      idGroomer: formValue.idGroomer,
      idSucursal: formValue.idSucursal,
      turnoNum: formValue.turnoNum,
      tiempoEstimadoInicio: now.toISOString(),
      tiempoEstimadoFin: endTime.toISOString(),
      prioridad: formValue.prioridad
    };

    this.isProcessing.set(true);
    this.showLoadingOverlay.set(true);
    this.loadingMessage.set('Creando atención y sincronizando con el servidor...');

    const now = new Date();
    const endTime = new Date(now.getTime() + 90 * 60000); // 1.5 horas después

    const params = {
      idCita: formValue.idCita,
      idGroomer: formValue.idGroomer,
      idSucursal: formValue.idSucursal,
      turnoNum: formValue.turnoNum,
      tiempoEstimadoInicio: now.toISOString(),
      tiempoEstimadoFin: endTime.toISOString(),
      prioridad: formValue.prioridad
    };

    this.isProcessing.set(true);
    this.showLoadingOverlay.set(true);
    this.loadingMessage.set('Creando atención y sincronizando con el servidor...');

    // 🔧 ESTRATEGIA HÍBRIDA: Si backend devuelve atención, úsala. Si no, haz polling
    this.attentionService.createFromAppointment(params).pipe(
      switchMap((atencion: any) => {
        // ✅ SI el backend devuelve la atención creada
        if (atencion && atencion.idAtencion) {
          console.log('✅ Backend devolvió la atención:', atencion.idAtencion);
          return of({ success: true, atencion });
        }

        // ❌ SI el backend devuelve null, hacer polling
        console.warn('⚠️ Backend devolvió null, iniciando polling...');
        this.loadingMessage.set('Sincronizando con base de datos...');

        return timer(0, 1000).pipe( // Reintentar cada 1 segundo
          switchMap(() => this.attentionService.getCola(formValue.idSucursal)),
          // Buscar la atención creada por idCita
          map(cola => cola.find(a => a.cita?.idCita === formValue.idCita)),
          // Filtrar hasta que encontremos la atención
          filter(atencion => !!atencion),
          // Tomar la primera coincidencia y detener el timer
          take(1),
          map(atencion => ({ success: true, atencion }))
        );
      })
    ).subscribe({
      next: (result: any) => {
        this.isProcessing.set(false);
        this.showLoadingOverlay.set(false);

        if (result.success && result.atencion?.idAtencion) {
          this.notificationService.success('Atención creada exitosamente');
          console.log('✅ Navegando a atención:', result.atencion.idAtencion);
          this.router.navigate([`/atenciones/${result.atencion.idAtencion}/atender`]);
        } else {
          this.notificationService.error('No se pudo obtener la atención creada');
          this.router.navigate(['/atenciones']);
        }
      },
      error: (error: any) => {
        this.isProcessing.set(false);
        this.showLoadingOverlay.set(false);
        console.error('❌ Error en creación o polling:', error);
        this.notificationService.error('Error al crear la atención');

        // Fallback: ir a la cola de atenciones
        setTimeout(() => {
          this.router.navigate(['/atenciones']);
        }, 1500);
      }
    });
  }

  volver() {
    this.router.navigate(['/appointments']);
  }

  autoGenerarTurno() {
    const turno = Math.floor(Math.random() * 1000);
    this.atencionForm.patchValue({ turnoNum: turno });
  }
}
