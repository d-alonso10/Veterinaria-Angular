import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService, IUsuarioSistema } from '../../../core/services/user.service';
import { BranchService, ISucursal } from '../../../core/services/branch.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  branches: ISucursal[] = [];
  isEditMode = false;
  userId: number | null = null;
  isLoading = false;

  roles = [
    { value: 'admin', label: 'Administrador' },
    { value: 'recepcionista', label: 'Recepcionista' },
    { value: 'groomer', label: 'Groomer' },
    { value: 'veterinario', label: 'Veterinario' },
    { value: 'contador', label: 'Contador' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private branchService: BranchService,
    private notificationService: NotificationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      rol: ['recepcionista', Validators.required],
      idSucursal: [1, Validators.required],
      activo: [true]
    });
  }

  ngOnInit(): void {
    this.loadBranches();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.userId = Number(id);
      this.userForm.get('password')?.clearValidators();
      this.loadUser(this.userId);
    } else {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.userForm.get('password')?.updateValueAndValidity();
  }

  loadBranches() {
    this.branchService.getAll().subscribe({
      next: (data) => this.branches = data,
      error: () => this.notificationService.error('Error al cargar sucursales')
    });
  }

  loadUser(id: number) {
    this.userService.getById(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          rol: user.rol,
          idSucursal: user.idSucursal,
          activo: user.activo
        });
      },
      error: () => {
        this.notificationService.error('Error al cargar usuario');
        this.router.navigate(['/admin/users']);
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isLoading = true;
      const userData: IUsuarioSistema = this.userForm.value;

      const operation = this.isEditMode
        ? this.userService.update(this.userId!, userData)
        : this.userService.create(userData);

      operation.subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success(`Usuario ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`);
          this.router.navigate(['/admin/users']);
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error saving user', err);
          this.notificationService.error(`Error al ${this.isEditMode ? 'actualizar' : 'crear'} usuario`);
        }
      });
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
