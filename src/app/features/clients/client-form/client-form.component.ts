import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { Cliente } from '../../../core/models/client.model';

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

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
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
    this.apiService.get<Cliente>(`/clientes/${id}`).subscribe({
      next: (response: any) => {
        if (response.exito && response.datos) {
          this.clientForm.patchValue(response.datos);
        }
      },
      error: (err: any) => console.error('Error loading client', err)
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      const clientData: Cliente = this.clientForm.value;

      if (this.isEditing && this.clientId) {
        this.apiService.put<Cliente>(`/clientes/${this.clientId}`, clientData).subscribe({
          next: (response: any) => {
            if (response.exito) {
              this.router.navigate(['/clients']);
            }
          },
          error: (err: any) => console.error('Error updating client', err)
        });
      } else {
        this.apiService.post<Cliente>('/clientes', clientData).subscribe({
          next: (response: any) => {
            if (response.exito) {
              this.router.navigate(['/clients']);
            }
          },
          error: (err: any) => console.error('Error creating client', err)
        });
      }
    }
  }

  cancel() {
    this.router.navigate(['/clients']);
  }
}
