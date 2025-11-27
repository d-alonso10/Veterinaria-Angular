import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GroomerService, IGroomer } from '../../../core/services/groomer.service';
import { NotificationService } from '../../../core/services/notification.service';

interface WeekDay {
  key: string;
  label: string;
  enabled: boolean;
  inicio: string;
  fin: string;
}

@Component({
  selector: 'app-groomer-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './groomer-form.component.html',
  styleUrl: './groomer-form.component.css'
})
export class GroomerFormComponent implements OnInit {
  groomerForm: FormGroup;
  isEditMode = false;
  groomerId: number | null = null;
  isLoading = false;

  // Especialidades
  mainSpecialties: string[] = [];
  additionalSpecialties: string[] = [];

  // Horarios
  weekDays: WeekDay[] = [
    { key: 'lunes', label: 'Lunes', enabled: false, inicio: '08:00', fin: '17:00' },
    { key: 'martes', label: 'Martes', enabled: false, inicio: '08:00', fin: '17:00' },
    { key: 'miercoles', label: 'Miércoles', enabled: false, inicio: '08:00', fin: '17:00' },
    { key: 'jueves', label: 'Jueves', enabled: false, inicio: '08:00', fin: '17:00' },
    { key: 'viernes', label: 'Viernes', enabled: false, inicio: '08:00', fin: '17:00' },
    { key: 'sabado', label: 'Sábado', enabled: false, inicio: '08:00', fin: '14:00' },
    { key: 'domingo', label: 'Domingo', enabled: false, inicio: '08:00', fin: '14:00' }
  ];

  constructor(
    private fb: FormBuilder,
    private groomerService: GroomerService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.groomerForm = this.fb.group({
      nombre: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.groomerId = Number(id);
      this.loadGroomer(this.groomerId);
    }
  }

  loadGroomer(id: number) {
    this.groomerService.getById(id).subscribe({
      next: (groomer) => {
        this.groomerForm.patchValue({ nombre: groomer.nombre });

        // Parse especialidades
        try {
          const esp = JSON.parse(groomer.especialidades);
          this.mainSpecialties = esp.principales || [];
          this.additionalSpecialties = esp.adicionales || [];
        } catch (e) {
          console.error('Error parsing especialidades', e);
        }

        // Parse disponibilidad
        try {
          const disp = JSON.parse(groomer.disponibilidad);
          this.weekDays.forEach(day => {
            if (disp[day.key]) {
              day.enabled = true;
              day.inicio = disp[day.key].inicio || '08:00';
              day.fin = disp[day.key].fin || '17:00';
            }
          });
        } catch (e) {
          console.error('Error parsing disponibilidad', e);
        }
      },
      error: () => {
        this.notificationService.error('Error al cargar groomer');
        this.router.navigate(['/groomers']);
      }
    });
  }

  toggleMainSpecialty(specialty: string) {
    const index = this.mainSpecialties.indexOf(specialty);
    if (index > -1) {
      this.mainSpecialties.splice(index, 1);
    } else {
      this.mainSpecialties.push(specialty);
    }
  }

  toggleAdditionalSpecialty(specialty: string) {
    const index = this.additionalSpecialties.indexOf(specialty);
    if (index > -1) {
      this.additionalSpecialties.splice(index, 1);
    } else {
      this.additionalSpecialties.push(specialty);
    }
  }

  hasAnyDayEnabled(): boolean {
    return this.weekDays.some(day => day.enabled);
  }

  setDefaultSchedule() {
    this.weekDays.forEach((day, index) => {
      if (index < 5) { // Lun-Vie
        day.enabled = true;
        day.inicio = '08:00';
        day.fin = '17:00';
      }
    });
  }

  isFormValid(): boolean {
    const hasName = this.groomerForm.get('nombre')?.valid || false;
    const hasSpecialties = this.mainSpecialties.length > 0 || this.additionalSpecialties.length > 0;
    const hasSchedule = this.hasAnyDayEnabled();
    return hasName && hasSpecialties && hasSchedule;
  }

  buildEspecialidadesJSON(): string {
    return JSON.stringify({
      principales: this.mainSpecialties,
      adicionales: this.additionalSpecialties
    });
  }

  buildDisponibilidadJSON(): string {
    const disponibilidad: any = {};
    this.weekDays.forEach(day => {
      if (day.enabled) {
        disponibilidad[day.key] = {
          inicio: day.inicio,
          fin: day.fin
        };
      }
    });
    return JSON.stringify(disponibilidad);
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.isLoading = true;

      const groomerData: IGroomer = {
        nombre: this.groomerForm.get('nombre')?.value,
        especialidades: this.buildEspecialidadesJSON(),
        disponibilidad: this.buildDisponibilidadJSON()
      };

      console.log('Sending groomer data:', groomerData);

      const operation = this.isEditMode
        ? this.groomerService.update(this.groomerId!, groomerData)
        : this.groomerService.create(groomerData);

      operation.subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success(`Groomer ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`);
          this.router.navigate(['/groomers']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error saving groomer', err);
          this.notificationService.error(`Error al ${this.isEditMode ? 'actualizar' : 'crear'} groomer`);
        }
      });
    } else {
      this.groomerForm.markAllAsTouched();
      this.notificationService.error('Por favor completa todos los campos requeridos');
    }
  }
}
