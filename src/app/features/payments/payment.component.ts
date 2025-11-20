import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../core/services/payment.service';
import { NotificationService } from '../../core/services/notification.service';
import { IPago } from '../../core/models/models';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit {
  paymentForm: FormGroup;
  invoiceId: number | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private notificationService: NotificationService
  ) {
    this.paymentForm = this.fb.group({
      monto: ['', [Validators.required, Validators.min(0)]],
      metodo: ['efectivo', Validators.required],
      referencia: ['']
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('invoiceId');
      if (id) {
        this.invoiceId = Number(id);
        // Optionally fetch invoice details here to show amount due
      }
    });
  }

  onSubmit() {
    if (this.paymentForm.valid && this.invoiceId) {
      this.isLoading = true;
      const pagoData: IPago = {
        idFactura: this.invoiceId,
        ...this.paymentForm.value
      };

      this.paymentService.registrarPago(pagoData).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success('Pago registrado correctamente');
          this.router.navigate(['/dashboard']); // Or back to queue
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error registering payment', err);
          this.notificationService.error('Error al registrar pago');
        }
      });
    }
  }
}
