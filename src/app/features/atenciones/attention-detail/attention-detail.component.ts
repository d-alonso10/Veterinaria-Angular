import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AttentionService } from '../../../core/services/attention.service';
import { ServiceService } from '../../../core/services/service.service';
import { NotificationService } from '../../../core/services/notification.service';
import { IServicio } from '../../../core/models/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-attention-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attention-detail.component.html',
  styleUrl: './attention-detail.component.css'
})
export class AttentionDetailComponent implements OnInit {
  attentionId: number | null = null;
  details: any[] = [];
  servicios: IServicio[] = [];
  selectedServiceId: number | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private attentionService: AttentionService,
    private serviceService: ServiceService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.attentionId = Number(id);
        this.loadAttention(this.attentionId);
        this.loadDetails(this.attentionId);
        this.loadServicios();
      }
    });
  }

  attention: any = null; // Should be IAtencion

  loadAttention(id: number) {
    this.attentionService.getById(id).subscribe({
      next: (data) => this.attention = data,
      error: () => this.notificationService.error('Error al cargar la atención')
    });
  }

  loadDetails(id: number) {
    this.attentionService.getDetails(id).subscribe({
      next: (data) => this.details = data,
      error: () => this.notificationService.error('Error al cargar detalles')
    });
  }

  loadServicios() {
    this.serviceService.getServices().subscribe({
      next: (data) => this.servicios = data
    });
  }

  changeState(newState: string) {
    if (this.attentionId) {
      this.attentionService.updateState(this.attentionId, newState).subscribe({
        next: () => {
          this.notificationService.success(`Estado actualizado a ${newState}`);
          this.loadAttention(this.attentionId!);
        },
        error: () => this.notificationService.error('Error al actualizar estado')
      });
    }
  }

  addService() {
    if (this.attentionId && this.selectedServiceId) {
      this.isLoading = true;
      const serviceData = {
        idServicio: this.selectedServiceId,
        cantidad: 1,
        notas: ''
      };

      this.attentionService.addService(this.attentionId, serviceData).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success('Servicio agregado');
          this.loadDetails(this.attentionId!);
          this.selectedServiceId = null;
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.error('Error al agregar servicio');
        }
      });
    }
  }

  finishAttention() {
    if (this.attentionId && confirm('¿Finalizar atención y generar orden de pago?')) {
      this.attentionService.finishAttention(this.attentionId).subscribe({
        next: () => {
          this.notificationService.success('Atención finalizada');
          this.router.navigate(['/billing/new', this.attentionId]);
        },
        error: () => this.notificationService.error('Error al finalizar atención')
      });
    }
  }
}
