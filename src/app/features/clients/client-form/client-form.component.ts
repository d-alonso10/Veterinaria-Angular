import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../../core/services/client.service';
import { Cliente } from '../../../core/models/client.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditing = false;
  clientId: number | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {
    this.clientForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      dniRuc: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      direccion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.clientId = +params['id'];
        this.loadClient(this.clientId);
      }
    });
  }

  loadClient(id: number) {
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue(client);
      },
      error: (err: any) => {
        console.error('Error loading client', err);
        this.notificationService.error('Error al cargar cliente');
      }
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.isLoading = true;
      const clientData: Cliente = this.clientForm.value;

      if (this.isEditing && this.clientId) {
        this.clientService.updateClient(this.clientId, clientData).subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.success('Cliente actualizado correctamente');
            this.router.navigate(['/clients']);
          },
          error: (err: any) => {
            this.isLoading = false;
            console.error('Error updating client', err);
            this.notificationService.error('Error al actualizar cliente');
          }
        });
      } else {
        this.clientService.createClient(clientData).subscribe({
          next: () => {
            this.isLoading = false;
            this.notificationService.success('Cliente creado correctamente');
            this.router.navigate(['/clients']);
          },
          error: (err: any) => {
            this.isLoading = false;
            console.error('Error creating client', err);
            this.notificationService.error('Error al crear cliente');
          }
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/clients']);
  }
}

