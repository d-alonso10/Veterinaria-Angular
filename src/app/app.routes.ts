import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirigir la ruta vacía al login por defecto
  { path: '', redirectTo: '/login', pathMatch: 'full' },

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
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent)
      },
      {
        path: 'appointments/new',
        loadComponent: () => import('./features/appointments/appointment-form/appointment-form.component').then(m => m.AppointmentFormComponent)
      },
      {
        path: 'queue',
        loadComponent: () => import('./features/atenciones/atencion-cola/atencion-cola.component').then(m => m.AtencionColaComponent)
      },
      {
        path: 'reception',
        loadComponent: () => import('./features/atenciones/reception/reception.component').then(m => m.ReceptionComponent)
      },
      {
        path: 'attentions/:id',
        loadComponent: () => import('./features/atenciones/attention-detail/attention-detail.component').then(m => m.AttentionDetailComponent)
      },
      {
        path: 'reports/average-times',
        loadComponent: () => import('./features/reports/reporte-tiempos/reporte-tiempos.component').then(m => m.ReporteTiemposComponent)
      },
      {
        path: 'billing/new/:attentionId',
        loadComponent: () => import('./features/billing/billing.component').then(m => m.BillingComponent)
      },
      {
        path: 'payments/new/:invoiceId',
        loadComponent: () => import('./features/payments/payment.component').then(m => m.PaymentComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
