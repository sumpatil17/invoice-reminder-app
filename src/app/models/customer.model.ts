/**
 * Customer model interface
 */
export interface Customer {
  customerId: number;
  customerName: string;
  address: string;
  email?: string;
  phoneNumber?: string;
  site: string; // Required field
  customerType: string; // AMC or Other
  labDetails?: string;
  licenseNo?: string;
  totalNoOfLicenses?: number;
  softwareVersion?: string;
  mu?: string;
  isActive: boolean;
  createdDate: Date;
  modifiedDate?: Date;
  amcContracts?: AMCContract[];
  displayName?: string; // For dropdown: CustomerName - Site
}

/**
 * AMC Contract model interface
 */
export interface AMCContract {
  amcId: number;
  customerId: number;
  poNumber: string;
  poDate: Date;
  poValue: number;
  multiplyFactor: number;
  poValueInINR?: number; // Calculated, not stored
  amcStartDate: Date;
  amcEndDate: Date;
  description?: string;
  status: string;
  reminderSent: boolean;
  lastReminderDate?: Date;
  createdDate: Date;
  modifiedDate?: Date;
  customer?: Customer;
  daysUntilExpiry?: number;
  isExpiringSoon?: boolean;
  isExpired?: boolean;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
