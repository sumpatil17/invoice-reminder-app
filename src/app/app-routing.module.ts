import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerFormComponent } from './components/customer-form/customer-form.component';
import { AMCListComponent } from './components/amc-list/amc-list.component';
import { AMCFormComponent } from './components/amc-form/amc-form.component';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },

  // Customer routes
  { path: 'customers', component: CustomerListComponent },
  { path: 'customers/add', component: CustomerFormComponent },
  { path: 'customers/edit/:id', component: CustomerFormComponent },

  // AMC routes
  { path: 'amc', component: AMCListComponent },
  { path: 'amc/add', component: AMCFormComponent },
  { path: 'amc/edit/:id', component: AMCFormComponent },
  { path: 'amc/customer/:customerId', component: AMCListComponent },

  // Fallback route
  { path: '**', redirectTo: '/dashboard' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
