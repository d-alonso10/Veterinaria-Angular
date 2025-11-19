import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/client-list/client-list.component').then(m => m.ClientListComponent)
      },
      {
        path: 'clients/new',
        loadComponent: () => import('./features/clients/client-form/client-form.component').then(m => m.ClientFormComponent)
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./features/clients/client-form/client-form.component').then(m => m.ClientFormComponent)
      },
      {
        path: 'pets',
        loadComponent: () => import('./features/pets/mascota-list/mascota-list.component').then(m => m.MascotaListComponent)
      },
      {
        path: 'pets/new',
        loadComponent: () => import('./features/pets/mascota-form/mascota-form.component').then(m => m.MascotaFormComponent)
      },
      {
        path: 'pets/:id',
        loadComponent: () => import('./features/pets/mascota-form/mascota-form.component').then(m => m.MascotaFormComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
