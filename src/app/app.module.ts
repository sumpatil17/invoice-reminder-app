import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { CustomerListComponent } from './components/customer-list/customer-list.component';
import { CustomerFormComponent } from './components/customer-form/customer-form.component';
import { AMCListComponent } from './components/amc-list/amc-list.component';
import { AMCFormComponent } from './components/amc-form/amc-form.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Services
import { CustomerService } from './services/customer.service';
import { AMCService } from './services/amc.service';

@NgModule({
  declarations: [
    AppComponent,
    CustomerListComponent,
    CustomerFormComponent,
    AMCListComponent,
    AMCFormComponent,
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [CustomerService, AMCService],
  bootstrap: [AppComponent],
})
export class AppModule {}
