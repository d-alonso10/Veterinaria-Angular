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
    this.route.paramMap.subscribe(params => {
      const id = params.get('attentionId');
      if (id) {
        this.attentionId = Number(id);
        this.loadAttention(this.attentionId);
      }
    });
  }

  loadAttention(id: number) {
    this.attentionService.getById(id).subscribe({
      next: (data: IAtencion) => {
        this.attention = data;
        // Auto-generate number based on timestamp for demo
        this.billingForm.patchValue({
          numero: Date.now().toString().slice(-6)
        });
      },
      error: () => this.notificationService.error('Error al cargar la atención')
    });
  }

  onSubmit() {
    if (this.billingForm.valid && this.attentionId) {
      this.isLoading = true;
      const facturaData: IFactura = {
        idAtencion: this.attentionId,
        ...this.billingForm.value,
        estado: 'pendiente'
      };

      this.billingService.createFactura(facturaData).subscribe({
        next: (factura: IFactura) => {
          this.isLoading = false;
          this.notificationService.success('Factura generada correctamente');
          this.router.navigate(['/payments/new', factura.idFactura]);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error creating invoice', err);
          this.notificationService.error('Error al generar factura');
        }
      });
    }
  }
}
