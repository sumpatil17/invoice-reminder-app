import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../models/customer.model';

/**
 * Component for adding/editing customers
 */
@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css'],
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode: boolean = false;
  customerId: number | null = null;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  pageTitle: string = 'Add New Customer';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.customerForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if editing existing customer
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.customerId = +params['id'];
        this.pageTitle = 'Edit Customer';
        this.loadCustomer(this.customerId);
      }
    });
  }

  /**
   * Create reactive form
   */
  createForm(): FormGroup {
    return this.fb.group({
      customerName: ['', [Validators.required, Validators.maxLength(200)]],
      address: ['', [Validators.required, Validators.maxLength(500)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.maxLength(20)]],
      site: ['', [Validators.required, Validators.maxLength(200)]],
      customerType: ['AMC', [Validators.required]],
      labDetails: ['', [Validators.maxLength(500)]],
      licenseNo: ['', [Validators.maxLength(100)]],
      totalNoOfLicenses: [null, [Validators.min(0)]],
      softwareVersion: ['', [Validators.maxLength(100)]],
      mu: ['', [Validators.maxLength(100)]],
      isActive: [true],
    });
  }

  /**
   * Load customer data for editing
   */
  loadCustomer(id: number): void {
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue({
          customerName: customer.customerName,
          address: customer.address,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          site: customer.site,
          customerType: customer.customerType,
          labDetails: customer.labDetails,
          licenseNo: customer.licenseNo,
          totalNoOfLicenses: customer.totalNoOfLicenses,
          softwareVersion: customer.softwareVersion,
          mu: customer.mu,
          isActive: customer.isActive,
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load customer data';
        console.error('Error loading customer:', error);
      },
    });
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.markFormGroupTouched(this.customerForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const customerData: Customer = {
      ...this.customerForm.value,
      customerId: this.customerId || 0,
      createdDate: new Date(),
    };

    const operation = this.isEditMode
      ? this.customerService.updateCustomer(this.customerId!, customerData)
      : this.customerService.createCustomer(customerData);

    operation.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/customers']);
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
            ? 'Failed to update customer. Please try again.'
            : 'Failed to create customer. Please try again.';
        }

        this.errorMessage = errorMsg;
      },
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/customers']);
  }

  /**
   * Mark all form fields as touched to show validation errors
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
    const field = this.customerForm.get(fieldName);
    return !!(field?.hasError(errorType) && field?.touched);
  }

  /**
   * Get error message for field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.customerForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('email')) {
      return 'Please enter a valid email address';
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
      customerName: 'Customer Name',
      address: 'Address',
      email: 'Email',
      phoneNumber: 'Phone Number',
      site: 'Site',
      customerType: 'Customer Type',
      labDetails: 'Lab Details',
      licenseNo: 'License No',
      totalNoOfLicenses: 'Total No of Licenses',
      softwareVersion: 'Software Version',
      mu: 'MU',
    };
    return labels[fieldName] || fieldName;
  }
}
