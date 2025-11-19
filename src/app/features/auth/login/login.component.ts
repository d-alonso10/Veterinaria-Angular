import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

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
    private apiService: ApiService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = null;
      const credentials = this.loginForm.value;

      this.apiService.post<any>('/auth/login', credentials).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          if (response.exito && response.datos) {
            // Assuming the token is in response.datos.token or similar
            // Adjust based on actual API response structure
            const token = response.datos.token || response.datos;
            localStorage.setItem('token', token);
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
