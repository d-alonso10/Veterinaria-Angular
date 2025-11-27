import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService, IUsuarioSistema } from '../../../core/services/user.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: IUsuarioSistema[] = [];
  isLoading = false;

  constructor(
    private userService: UserService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.users = data;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error loading users', error);
        this.notificationService.error('Error al cargar usuarios');
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.notificationService.success('Usuario eliminado correctamente');
          this.loadUsers();
        },
        error: () => this.notificationService.error('Error al eliminar usuario')
      });
    }
  }

  getRoleBadgeClass(rol: string): string {
    const classes: { [key: string]: string } = {
      'admin': 'badge-danger',
      'recepcionista': 'badge-primary',
      'groomer': 'badge-success',
      'veterinario': 'badge-info',
      'contador': 'badge-warning'
    };
    return classes[rol] || 'badge-secondary';
  }
}
