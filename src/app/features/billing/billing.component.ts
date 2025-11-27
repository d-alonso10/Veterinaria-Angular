import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BillingService } from '../../core/services/billing.service';
import { AttentionService } from '../../core/services/attention.service';
import { NotificationService } from '../../core/services/notification.service';
import { IAtencion, IFactura } from '../../core/models/models';

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  billingForm: FormGroup;
  attentionId: number | null = null;
  attention: IAtencion | null = null;
  serviceDetails: any[] = []; // Detalles de servicios realizados
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private billingService: BillingService,
    private attentionService: AttentionService,
    private notificationService: NotificationService
  ) {
    this.billingForm = this.fb.group({
      serie: ['F001', Validators.required],
      numero: ['', Validators.required],
      metodoPagoSugerido: ['efectivo', Validators.required]
    });
  }

  ngOnInit(): void {
    // Leer idAtencion desde route params (ruta: /billing/new/:attentionId) o query params (ruta: /billing?idAtencion=X)
    const routeId = this.route.snapshot.paramMap.get('attentionId');
    const queryId = this.route.snapshot.queryParamMap.get('idAtencion');

    const attentionId = routeId || queryId;

    if (attentionId) {
      this.attentionId = Number(attentionId);
      this.loadAttention(this.attentionId);
    } else {
      this.notificationService.error('No se especificó una atención');
      this.router.navigate(['/atenciones']);
    }
  }

  loadAttention(id: number) {
    this.attentionService.getById(id).subscribe({
      next: (data: IAtencion) => {
        this.attention = data;
        // Auto-generate number based on timestamp for demo
        this.billingForm.patchValue({
          numero: Date.now().toString().slice(-6)
        });

        // Cargar detalles de servicios realizados
        this.loadServiceDetails(id);
      },
      error: () => this.notificationService.error('Error al cargar la atención')
    });
  }

  loadServiceDetails(id: number) {
    this.attentionService.getDetails(id).subscribe({
      next: (details) => {
        this.serviceDetails = details;
        console.log('📋 Servicios cargados:', details);
      },
      error: (err) => {
        console.error('Error cargando detalles:', err);
        this.notificationService.error('Error al cargar servicios');
      }
    });
  }

  getSubtotal(): number {
    return this.serviceDetails.reduce((sum, detail) => sum + (detail.subtotal || 0), 0);
  }

  onSubmit() {
    if (this.billingForm.valid && this.attentionId) {
      this.isLoading = true;
      const formValue = this.billingForm.value;

      this.billingService.createFactura(
        this.attentionId,
        formValue.serie,
        formValue.numero,
        formValue.metodoPagoSugerido
      ).subscribe({
        next: (factura: IFactura) => {
          this.isLoading = false;
          this.notificationService.success('Factura generada. Redirigiendo a registro de pago...');

          // Redirección con retraso para UX
          setTimeout(() => {
            this.router.navigate(['/payments/new', factura.idFactura]);
          }, 1000);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error creating invoice', err);
          this.notificationService.error('Error al generar factura');
        }
      });
    }
  }

  volver() {
    this.router.navigate(['/atenciones']);
  }
}
