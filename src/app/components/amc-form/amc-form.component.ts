import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AMCService } from '../../services/amc.service';
import { CustomerService } from '../../services/customer.service';
import { AMCContract, Customer } from '../../models/customer.model';

/**
 * Component for adding/editing AMC contracts
 */
@Component({
  selector: 'app-amc-form',
  templateUrl: './amc-form.component.html',
  styleUrls: ['./amc-form.component.css'],
})
export class AMCFormComponent implements OnInit {
  amcForm: FormGroup;
  isEditMode: boolean = false;
  amcId: number | null = null;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  pageTitle: string = 'Add New AMC Contract';
  customers: Customer[] = [];
  selectedCustomerId: number | null = null;
  poValueInINR: number = 0; // Calculated value for display

  constructor(
    private fb: FormBuilder,
    private amcService: AMCService,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.amcForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadCustomers();

    // Check if editing existing AMC contract
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.amcId = +params['id'];
        this.pageTitle = 'Edit AMC Contract';
        this.loadAMCContract(this.amcId);
      }
    });

    // Check if customer ID passed as query param
    this.route.queryParams.subscribe((params) => {
      if (params['customerId'] && !this.isEditMode) {
        this.selectedCustomerId = +params['customerId'];
        this.amcForm.patchValue({ customerId: this.selectedCustomerId });
      }
    });
  }

  /**
   * Create reactive form
   */
  createForm(): FormGroup {
    const form = this.fb.group({
      customerId: [null, [Validators.required]],
      poNumber: ['', [Validators.required, Validators.maxLength(100)]],
      poDate: ['', [Validators.required]],
      poValue: [null, [Validators.required, Validators.min(0.01)]],
      multiplyFactor: [83, [Validators.required, Validators.min(0.01)]],
      amcStartDate: ['', [Validators.required]],
      amcEndDate: ['', [Validators.required]],
      description: ['', [Validators.maxLength(500)]],
      status: ['Active'],
    });

    // Listen to changes in poValue and multiplyFactor to calculate INR value
    form.get('poValue')?.valueChanges.subscribe(() => this.calculateINRValue());
    form
      .get('multiplyFactor')
      ?.valueChanges.subscribe(() => this.calculateINRValue());

    return form;
  }

  /**
   * Calculate INR value from USD
   */
  calculateINRValue(): void {
    const poValue = this.amcForm.get('poValue')?.value || 0;
    const multiplyFactor = this.amcForm.get('multiplyFactor')?.value || 83;
    this.poValueInINR = poValue * multiplyFactor;
  }

  /**
   * Load all customers for dropdown
   */
  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (data) => {
        // Add display name for dropdown (CustomerName - Site)
        this.customers = data.map((customer) => ({
          ...customer,
          displayName: `${customer.customerName} - ${customer.site}`,
        }));
      },
      error: (error) => {
        this.errorMessage = 'Failed to load customers';
        console.error('Error loading customers:', error);
      },
    });
  }

  /**
   * Load AMC contract data for editing
   */
  loadAMCContract(id: number): void {
    this.amcService.getAMCContractById(id).subscribe({
      next: (contract) => {
        this.amcForm.patchValue({
          customerId: contract.customerId,
          poNumber: contract.poNumber,
          poDate: this.formatDateForInput(contract.poDate),
          poValue: contract.poValue,
          multiplyFactor: contract.multiplyFactor,
          amcStartDate: this.formatDateForInput(contract.amcStartDate),
          amcEndDate: this.formatDateForInput(contract.amcEndDate),
          description: contract.description,
          status: contract.status,
        });
        this.calculateINRValue(); // Calculate initial INR value
      },
      error: (error) => {
        this.errorMessage = 'Failed to load AMC contract data';
        console.error('Error loading AMC contract:', error);
      },
    });
  }

  /**
   * Format date for input field (YYYY-MM-DD)
   */
  formatDateForInput(date: Date): string {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.amcForm.invalid) {
      this.markFormGroupTouched(this.amcForm);
      return;
    }

    // Validate dates
    const startDate = new Date(this.amcForm.value.amcStartDate);
    const endDate = new Date(this.amcForm.value.amcEndDate);

    if (endDate <= startDate) {
      this.errorMessage = 'AMC End Date must be after Start Date';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const amcData: AMCContract = {
      ...this.amcForm.value,
      amcId: this.amcId || 0,
      createdDate: new Date(),
      reminderSent: false,
    };

    const operation = this.isEditMode
      ? this.amcService.updateAMCContract(this.amcId!, amcData)
      : this.amcService.createAMCContract(amcData);

    operation.subscribe({
      next: () => {
        this.isSubmitting = false;
        if (this.selectedCustomerId) {
          this.router.navigate(['/amc/customer', this.selectedCustomerId]);
        } else {
          this.router.navigate(['/amc']);
        }
      },
      error: (error) => {
        this.isSubmitting = false;

        // Extract error message based on response format
        let errorMsg = '';

        if (error.status === 400) {
          if (typeof error.error === 'string') {
            errorMsg = error.error;
          } else if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
              errorMsg = error.error.message;
            } else if (error.error.title) {
              errorMsg = error.error.title;
            } else if (error.error.errors) {
              const errors = Object.values(error.error.errors).flat();
              errorMsg = errors.join(', ');
            } else {
              errorMsg = JSON.stringify(error.error);
            }
          }
        }

        // Fallback to generic error message if no specific message found
        if (!errorMsg) {
          errorMsg = this.isEditMode
            ? 'Failed to update AMC contract. Please try again.'
            : 'Failed to create AMC contract. Please try again.';
        }

        this.errorMessage = errorMsg;
      },
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    if (this.selectedCustomerId) {
      this.router.navigate(['/amc/customer', this.selectedCustomerId]);
    } else {
      this.router.navigate(['/amc']);
    }
  }

  /**
   * Mark all form fields as touched
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.amcForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

  /**
   * Get error message for field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.amcForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be greater than 0`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }

    return '';
  }

  /**
   * Get friendly field label
   */
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      customerId: 'Customer',
      poNumber: 'PO Number',
      poDate: 'PO Date',
      poValue: 'PO Value',
      multiplyFactor: 'Multiply Factor',
      amcStartDate: 'AMC Start Date',
      amcEndDate: 'AMC End Date',
      description: 'Description',
    };
    return labels[fieldName] || fieldName;
  }
}
