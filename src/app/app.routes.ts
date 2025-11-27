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
        path: 'atenciones',
        loadComponent: () => import('./features/atenciones/atencion-cola/atencion-cola.component').then(m => m.AtencionColaComponent)
      },
      {
        path: 'atenciones/nueva',
        loadComponent: () => import('./features/atenciones/crear-atencion/crear-atencion.component').then(m => m.CrearAtencionComponent)
      },
      {
        path: 'atenciones/:id/atender',
        loadComponent: () => import('./features/atenciones/atender/atender.component').then(m => m.AtenderComponent)
      },
      {
        path: 'atenciones/:id',
        loadComponent: () => import('./features/atenciones/attention-detail/attention-detail.component').then(m => m.AttentionDetailComponent)
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
        path: 'reports/income',
        loadComponent: () => import('./features/reports/reporte-ingresos/reporte-ingresos.component').then(m => m.ReporteIngresosComponent)
      },
      {
        path: 'reports/frequent-clients',
        loadComponent: () => import('./features/reports/clientes-frecuentes/clientes-frecuentes.component').then(m => m.ClientesFrecuentesComponent)
      },
      {
        path: 'facturas/nueva',
        loadComponent: () => import('./features/billing/billing.component').then(m => m.BillingComponent)
      },
      {
        path: 'billing',
        loadComponent: () => import('./features/billing/billing.component').then(m => m.BillingComponent)
      },
      {
        path: 'billing/new/:attentionId',
        loadComponent: () => import('./features/billing/billing.component').then(m => m.BillingComponent)
      },
      {
        path: 'pagos/nuevo',
        loadComponent: () => import('./features/payments/payment.component').then(m => m.PaymentComponent)
      },
      {
        path: 'payments/new/:invoiceId',
        loadComponent: () => import('./features/payments/payment.component').then(m => m.PaymentComponent)
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./features/admin/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'admin/users/new',
        loadComponent: () => import('./features/admin/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'admin/users/:id',
        loadComponent: () => import('./features/admin/user-form/user-form.component').then(m => m.UserFormComponent)
      },
      {
        path: 'admin/branches',
        loadComponent: () => import('./features/admin/branch-list/branch-list.component').then(m => m.BranchListComponent)
      },
      {
        path: 'admin/branches/new',
        loadComponent: () => import('./features/admin/branch-form/branch-form.component').then(m => m.BranchFormComponent)
      },
      {
        path: 'admin/branches/:id',
        loadComponent: () => import('./features/admin/branch-form/branch-form.component').then(m => m.BranchFormComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/services/service-list/service-list.component').then(m => m.ServiceListComponent)
      },
      {
        path: 'services/new',
        loadComponent: () => import('./features/services/service-form/service-form.component').then(m => m.ServiceFormComponent)
      },
      {
        path: 'services/:id',
        loadComponent: () => import('./features/services/service-form/service-form.component').then(m => m.ServiceFormComponent)
      },
      {
        path: 'groomers',
        loadComponent: () => import('./features/groomers/groomer-list/groomer-list.component').then(m => m.GroomerListComponent)
      },
      {
        path: 'groomers/new',
        loadComponent: () => import('./features/groomers/groomer-form/groomer-form.component').then(m => m.GroomerFormComponent)
      },
      {
        path: 'groomers/:id',
        loadComponent: () => import('./features/groomers/groomer-form/groomer-form.component').then(m => m.GroomerFormComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
