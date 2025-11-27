import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { BillingService } from '../../core/services/billing.service';
import { NotificationService } from '../../core/services/notification.service';
import { IFactura, IPago } from '../../core/models/models';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  invoiceId: number | null = null;
  factura = signal<IFactura | null>(null);
  isLoading = signal(false);
  isProcessing = signal(false);

  montoRecibido: number = 0;
  cambio: number = 0;

  // Exponer Math para el template
  Math = Math;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private billingService: BillingService,
    private notificationService: NotificationService
  ) {
    this.paymentForm = this.fb.group({
      metodo: ['efectivo', Validators.required],
      referencia: ['']
    });
  }

  ngOnInit(): void {
    // Leer idFactura desde route params o query params
    const routeId = this.route.snapshot.paramMap.get('invoiceId');
    const queryId = this.route.snapshot.queryParamMap.get('idFactura');

    const facturaId = routeId || queryId;

    if (facturaId) {
      this.invoiceId = Number(facturaId);
      this.loadFactura(this.invoiceId);
    } else {
      this.notificationService.error('No se especificó una factura');
      this.router.navigate(['/atenciones']);
    }
  }

  loadFactura(id: number) {
    this.isLoading.set(true);
    this.billingService.getById(id).subscribe({
      next: (factura: IFactura) => {
        this.factura.set(factura);
        this.montoRecibido = factura.total || 0;
        this.calcularCambio();
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('Error cargando factura', error);
        this.notificationService.error('Error al cargar la factura');
        this.isLoading.set(false);
        this.router.navigate(['/atenciones']);
      }
    });
  }

  calcularCambio() {
    const total = this.factura()?.total || 0;
    this.cambio = this.montoRecibido - total;
  }

  onMontoRecibidoChange() {
    this.calcularCambio();
  }

  onSubmit() {
    if (!this.paymentForm.valid || !this.invoiceId) {
      return;
    }

    const factura = this.factura();
    if (!factura) {
      this.notificationService.error('No se encontró la factura');
      return;
    }

    // Validar que el monto recibido sea suficiente
    if (this.montoRecibido < (factura.total || 0)) {
      this.notificationService.error('El monto recibido es insuficiente');
      return;
    }

    const confirmMessage = `
¿Confirmar registro de pago?

Factura: ${factura.serie}-${factura.numero}
Total: S/ ${(factura.total || 0).toFixed(2)}
Monto Recibido: S/ ${this.montoRecibido.toFixed(2)}
Cambio: S/ ${this.cambio.toFixed(2)}
Método: ${this.paymentForm.get('metodo')?.value}
    `;

    if (!confirm(confirmMessage)) {
      return;
    }

    this.isProcessing.set(true);
    const formValue = this.paymentForm.value;

    this.paymentService.registrarPago(
      this.invoiceId,
      factura.total || 0,
      formValue.metodo,
      formValue.referencia || ''
    ).subscribe({
      next: (message: string) => {
        this.isProcessing.set(false);
        this.notificationService.success('Pago registrado exitosamente');
        // Mostrar cambio si hay
        if (this.cambio > 0) {
          alert(`💵 Entregar cambio al cliente: S/ ${this.cambio.toFixed(2)}`);
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.isProcessing.set(false);
        console.error('Error registering payment', err);
        this.notificationService.error('Error al registrar pago');
      }
    });
  }

  volver() {
    this.router.navigate(['/atenciones']);
  }

  setMontoExacto() {
    this.montoRecibido = this.factura()?.total || 0;
    this.calcularCambio();
  }
}
