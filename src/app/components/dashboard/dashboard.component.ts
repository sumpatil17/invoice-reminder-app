import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { AMCService } from '../../services/amc.service';
import { AMCContract } from '../../models/customer.model';

/**
 * Dashboard component showing overview and reminders
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  totalCustomers: number = 0;
  totalContracts: number = 0;
  expiringContracts: AMCContract[] = [];
  expiredContracts: AMCContract[] = [];
  isLoading: boolean = true;

  constructor(
    private customerService: CustomerService,
    private amcService: AMCService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Load all dashboard data
   */
  loadDashboardData(): void {
    this.isLoading = true;

    // Load customers count
    this.customerService.getAllCustomers().subscribe({
      next: (customers) => {
        this.totalCustomers = customers.length;
      },
      error: (error) => console.error('Error loading customers:', error),
    });

    // Load all contracts
    this.amcService.getAllAMCContracts().subscribe({
      next: (contracts) => {
        this.totalContracts = contracts.length;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading contracts:', error);
        this.isLoading = false;
      },
    });

    // Load expiring contracts
    this.amcService.getExpiringContracts(30).subscribe({
      next: (contracts) => {
        this.expiringContracts = contracts;
      },
      error: (error) =>
        console.error('Error loading expiring contracts:', error),
    });

    // Load expired contracts
    this.amcService.getExpiredContracts().subscribe({
      next: (contracts) => {
        this.expiredContracts = contracts;
      },
      error: (error) =>
        console.error('Error loading expired contracts:', error),
    });
  }

  /**
   * Navigate to customers page
   */
  viewCustomers(): void {
    this.router.navigate(['/customers']);
  }

  /**
   * Navigate to AMC contracts page
   */
  viewContracts(): void {
    this.router.navigate(['/amc']);
  }

  /**
   * Navigate to expiring contracts
   */
  viewExpiringContracts(): void {
    this.router.navigate(['/amc']);
  }

  /**
   * View specific contract
   */
  viewContract(amcId: number): void {
    this.router.navigate(['/amc/edit', amcId]);
  }

  /**
   * Calculate days until expiry
   */
  calculateDaysUntilExpiry(endDate: Date): number {
    return this.amcService.calculateDaysUntilExpiry(endDate);
  }

  /**
   * Format date
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format currency
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }
}
