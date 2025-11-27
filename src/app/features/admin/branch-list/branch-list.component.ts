import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BranchService, ISucursal } from '../../../core/services/branch.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-branch-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.css'
})
export class BranchListComponent implements OnInit {
  branches: ISucursal[] = [];
  isLoading = false;

  constructor(
    private branchService: BranchService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches() {
    this.isLoading = true;
    this.branchService.getAll().subscribe({
      next: (data) => {
        this.isLoading = false;
        this.branches = data;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error loading branches', error);
        this.notificationService.error('Error al cargar sucursales');
      }
    });
  }

  deleteBranch(id: number) {
    if (confirm('¿Está seguro de eliminar esta sucursal?')) {
      this.branchService.delete(id).subscribe({
        next: () => {
          this.notificationService.success('Sucursal eliminada correctamente');
          this.loadBranches();
        },
        error: () => this.notificationService.error('Error al eliminar sucursal')
      });
    }
  }
}
