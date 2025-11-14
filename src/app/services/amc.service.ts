import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AMCContract } from '../models/customer.model';
import { environment } from '../../environments/environment';

/**
 * Service for managing AMC contract operations
 */
@Injectable({
  providedIn: 'root',
})
export class AMCService {
  private apiUrl = `${environment.apiBaseUrl}/amccontracts`;

  constructor(private http: HttpClient) {}

  /**
   * Get all AMC contracts
   */
  getAllAMCContracts(): Observable<AMCContract[]> {
    return this.http
      .get<AMCContract[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get AMC contract by ID
   */
  getAMCContractById(id: number): Observable<AMCContract> {
    return this.http
      .get<AMCContract>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get AMC contracts by customer ID
   */
  getAMCContractsByCustomerId(customerId: number): Observable<AMCContract[]> {
    return this.http
      .get<AMCContract[]>(`${this.apiUrl}/customer/${customerId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get expiring contracts (within specified days)
   */
  getExpiringContracts(days: number = 30): Observable<AMCContract[]> {
    return this.http
      .get<AMCContract[]>(`${this.apiUrl}/expiring`, {
        params: { days: days.toString() },
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get expired contracts
   */
  getExpiredContracts(): Observable<AMCContract[]> {
    return this.http
      .get<AMCContract[]>(`${this.apiUrl}/expired`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create new AMC contract
   */
  createAMCContract(amcContract: AMCContract): Observable<AMCContract> {
    return this.http
      .post<AMCContract>(this.apiUrl, amcContract)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update existing AMC contract
   */
  updateAMCContract(
    id: number,
    amcContract: AMCContract
  ): Observable<AMCContract> {
    return this.http
      .put<AMCContract>(`${this.apiUrl}/${id}`, amcContract)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete AMC contract
   */
  deleteAMCContract(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Calculate days until expiry
   */
  calculateDaysUntilExpiry(endDate: Date): number {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if contract is expiring soon (within 30 days)
   */
  isExpiringSoon(endDate: Date): boolean {
    const days = this.calculateDaysUntilExpiry(endDate);
    return days <= 30 && days >= 0;
  }

  /**
   * Check if contract has expired
   */
  isExpired(endDate: Date): boolean {
    return this.calculateDaysUntilExpiry(endDate) < 0;
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
