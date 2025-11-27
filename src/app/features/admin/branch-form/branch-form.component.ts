import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BranchService, ISucursal } from '../../../core/services/branch.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './branch-form.component.html',
  styleUrl: './branch-form.component.css'
})
export class BranchFormComponent implements OnInit {
  branchForm: FormGroup;
  isEditMode = false;
  branchId: number | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private branchService: BranchService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.branchForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      horarioApertura: ['08:00'],
      horarioCierre: ['18:00'],
      activo: [true]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.branchId = Number(id);
      this.loadBranch(this.branchId);
    }
  }

  loadBranch(id: number) {
    this.branchService.getById(id).subscribe({
      next: (branch) => {
        this.branchForm.patchValue(branch);
      },
      error: () => {
        this.notificationService.error('Error al cargar sucursal');
        this.router.navigate(['/admin/branches']);
      }
    });
  }

  onSubmit() {
    if (this.branchForm.valid) {
      this.isLoading = true;
      const branchData: ISucursal = this.branchForm.value;

      const operation = this.isEditMode
        ? this.branchService.update(this.branchId!, branchData)
        : this.branchService.create(branchData);

      operation.subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success(`Sucursal ${this.isEditMode ? 'actualizada' : 'creada'} correctamente`);
          this.router.navigate(['/admin/branches']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error saving branch', err);
          this.notificationService.error(`Error al ${this.isEditMode ? 'actualizar' : 'crear'} sucursal`);
        }
      });
    } else {
      this.branchForm.markAllAsTouched();
    }
  }
}
