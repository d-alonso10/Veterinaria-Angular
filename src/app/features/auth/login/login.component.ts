import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ApiResponse } from '../../../core/services/api.service';
import { ILoginResponse } from '../../../core/models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]], // Cambiado de username a email
    password_hash: ['', Validators.required]
  });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      const credentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response: ApiResponse<ILoginResponse>) => {
          this.isLoading = false;
          if (response.exito) {
            this.router.navigate(['/dashboard']);
          } else {
            this.errorMessage = response.mensaje || 'Error de autenticación';
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Login error', error);
          this.errorMessage = 'Usuario o contraseña incorrectos';
        }
      });
    }
  }
}
