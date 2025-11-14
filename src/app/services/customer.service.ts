import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Customer } from '../models/customer.model';
import { environment } from '../../environments/environment';

/**
 * Service for managing customer operations
 */
@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private apiUrl = `${environment.apiBaseUrl}/customers`;

  constructor(private http: HttpClient) {}

  /**
   * Get all customers
   */
  getAllCustomers(): Observable<Customer[]> {
    return this.http
      .get<Customer[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: number): Observable<Customer> {
    return this.http
      .get<Customer>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Search customers
   */
  searchCustomers(searchTerm: string): Observable<Customer[]> {
    return this.http
      .get<Customer[]>(`${this.apiUrl}/search`, {
        params: { searchTerm },
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new customer
   */
  createCustomer(customer: Customer): Observable<Customer> {
    return this.http
      .post<Customer>(this.apiUrl, customer)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update existing customer
   */
  updateCustomer(id: number, customer: Customer): Observable<Customer> {
    return this.http
      .put<Customer>(`${this.apiUrl}/${id}`, customer)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete customer
   */
  deleteCustomer(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);

    // Return the original error response so components can access status and error body
    return throwError(() => error);
  }
}
