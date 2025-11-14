import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

/**
 * Component for displaying and managing customer list
 */
@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css'],
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private customerService: CustomerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  /**
   * Load all customers
   */
  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.filteredCustomers = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load customers. Please try again.';
        this.isLoading = false;
        console.error('Error loading customers:', error);
      },
    });
  }

  /**
   * Search customers
   */
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCustomers = this.customers;
      return;
    }

    this.customerService.searchCustomers(this.searchTerm).subscribe({
      next: (data) => {
        this.filteredCustomers = data;
      },
      error: (error) => {
        this.errorMessage = 'Search failed. Please try again.';
        console.error('Error searching customers:', error);
      },
    });
  }

  /**
   * Clear search
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredCustomers = this.customers;
  }

  /**
   * Navigate to add customer page
   */
  addCustomer(): void {
    this.router.navigate(['/customers/add']);
  }

  /**
   * Navigate to edit customer page
   */
  editCustomer(id: number): void {
    this.router.navigate(['/customers/edit', id]);
  }

  /**
   * View customer details
   */
  viewCustomer(id: number): void {
    this.router.navigate(['/customers/view', id]);
  }

  /**
   * Delete customer
   */
  deleteCustomer(id: number, customerName: string): void {
    if (confirm(`Are you sure you want to delete ${customerName}?`)) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.successMessage = 'Customer deleted successfully';
          this.loadCustomers();
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete customer. Please try again.';
          console.error('Error deleting customer:', error);
        },
      });
    }
  }

  /**
   * View customer's AMC contracts
   */
  viewAMCContracts(customerId: number): void {
    this.router.navigate(['/amc/customer', customerId]);
  }
}
