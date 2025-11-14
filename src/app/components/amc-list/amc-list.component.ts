import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AMCService } from '../../services/amc.service';
import { AMCContract } from '../../models/customer.model';

/**
 * Component for displaying and managing AMC contracts
 */
@Component({
  selector: 'app-amc-list',
  templateUrl: './amc-list.component.html',
  styleUrls: ['./amc-list.component.css'],
})
export class AMCListComponent implements OnInit {
  amcContracts: AMCContract[] = [];
  filteredContracts: AMCContract[] = [];
  customerId: number | null = null;
  filterType: string = 'all'; // all, expiring, expired
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  expiringDays: number = 30;

  constructor(
    private amcService: AMCService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check if filtering by customer
    this.route.params.subscribe((params) => {
      if (params['customerId']) {
        this.customerId = +params['customerId'];
        this.loadAMCContractsByCustomer(this.customerId);
      } else {
        this.loadAllAMCContracts();
      }
    });
  }

  /**
   * Load all AMC contracts
   */
  loadAllAMCContracts(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.amcService.getAllAMCContracts().subscribe({
      next: (data) => {
        this.amcContracts = this.calculateExpiryInfo(data);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load AMC contracts. Please try again.';
        this.isLoading = false;
        console.error('Error loading AMC contracts:', error);
      },
    });
  }

  /**
   * Load AMC contracts for specific customer
   */
  loadAMCContractsByCustomer(customerId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.amcService.getAMCContractsByCustomerId(customerId).subscribe({
      next: (data) => {
        this.amcContracts = this.calculateExpiryInfo(data);
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load AMC contracts. Please try again.';
        this.isLoading = false;
        console.error('Error loading AMC contracts:', error);
      },
    });
  }

  /**
   * Calculate expiry information for contracts
   */
  calculateExpiryInfo(contracts: AMCContract[]): AMCContract[] {
    return contracts.map((contract) => ({
      ...contract,
      daysUntilExpiry: this.amcService.calculateDaysUntilExpiry(
        contract.amcEndDate
      ),
      isExpiringSoon: this.amcService.isExpiringSoon(contract.amcEndDate),
      isExpired: this.amcService.isExpired(contract.amcEndDate),
    }));
  }

  /**
   * Apply filter based on selection
   */
  applyFilter(): void {
    switch (this.filterType) {
      case 'expiring':
        this.filteredContracts = this.amcContracts.filter(
          (c) => c.isExpiringSoon
        );
        break;
      case 'expired':
        this.filteredContracts = this.amcContracts.filter((c) => c.isExpired);
        break;
      case 'active':
        this.filteredContracts = this.amcContracts.filter(
          (c) => !c.isExpired && !c.isExpiringSoon
        );
        break;
      default:
        this.filteredContracts = this.amcContracts;
    }
  }

  /**
   * Get reminder count
   */
  getReminderCount(): number {
    return this.amcContracts.filter((c) => c.isExpiringSoon || c.isExpired)
      .length;
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(contract: AMCContract): string {
    if (contract.isExpired) return 'badge bg-danger';
    if (contract.isExpiringSoon) return 'badge bg-warning text-dark';
    return 'badge bg-success';
  }

  /**
   * Get status text
   */
  getStatusText(contract: AMCContract): string {
    if (contract.isExpired) return 'Expired';
    if (contract.isExpiringSoon)
      return `Expiring in ${contract.daysUntilExpiry} days`;
    return 'Active';
  }

  /**
   * Navigate to add AMC contract page
   */
  addAMCContract(): void {
    if (this.customerId) {
      this.router.navigate(['/amc/add'], {
        queryParams: { customerId: this.customerId },
      });
    } else {
      this.router.navigate(['/amc/add']);
    }
  }

  /**
   * Navigate to edit AMC contract page
   */
  editAMCContract(id: number): void {
    this.router.navigate(['/amc/edit', id]);
  }

  /**
   * View AMC contract details
   */
  viewAMCContract(id: number): void {
    this.router.navigate(['/amc/view', id]);
  }

  /**
   * Delete AMC contract
   */
  deleteAMCContract(id: number, poNumber: string): void {
    if (confirm(`Are you sure you want to delete AMC contract ${poNumber}?`)) {
      this.amcService.deleteAMCContract(id).subscribe({
        next: () => {
          this.successMessage = 'AMC contract deleted successfully';
          if (this.customerId) {
            this.loadAMCContractsByCustomer(this.customerId);
          } else {
            this.loadAllAMCContracts();
          }
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (error) => {
          this.errorMessage =
            'Failed to delete AMC contract. Please try again.';
          console.error('Error deleting AMC contract:', error);
        },
      });
    }
  }

  /**
   * Navigate back to customers
   */
  backToCustomers(): void {
    this.router.navigate(['/customers']);
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
}
