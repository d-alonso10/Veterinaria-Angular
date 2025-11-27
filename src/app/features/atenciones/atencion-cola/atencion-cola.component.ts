import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { startWith, switchMap, takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AttentionService } from '../../../core/services/attention.service';
import { IAtencion } from '../../../core/models/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-atencion-cola',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './atencion-cola.component.html',
  styleUrl: './atencion-cola.component.css'
})
export class AtencionColaComponent implements OnInit, OnDestroy {
  cola = signal<IAtencion[]>([]);
  private destroy$ = new Subject<void>();
  lastUpdated = new Date();

  constructor(
    private attentionService: AttentionService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.attentionService.getCola(1)), // Hardcoded sucursal 1
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.cola.set(data);
          this.lastUpdated = new Date();
        },
        error: (err: any) => console.error('Error loading queue', err)
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAtencionesByEstado(estado: string): IAtencion[] {
    return this.cola().filter(a => a.estado === estado);
  }

  getPetInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  calculateDuration(inicio: string, fin?: string): string {
    const start = new Date(inicio);
    const end = fin ? new Date(fin) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min`;
    }

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  }

  iniciarServicio(event: Event, idAtencion: number) {
    event.stopPropagation();

    this.attentionService.updateEstado(idAtencion, 'en_servicio').subscribe({
      next: () => {
        this.notificationService.success('Servicio iniciado');
        // Reload cola
        this.attentionService.getCola(1).subscribe(data => this.cola.set(data));
      },
      error: () => {
        this.notificationService.error('Error al iniciar servicio');
      }
    });
  }

  continuarAtencion(idAtencion: number) {
    this.router.navigate(['/atenciones', idAtencion, 'atender']);
  }

  generarFactura(idAtencion: number) {
    this.router.navigate(['/facturas/nueva'], { queryParams: { idAtencion } });
  }
}
