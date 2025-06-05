import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Invoice } from '../models/invoice.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private dataUrl = '/assets/data/data.json';

  constructor(private http: HttpClient) {}

  getInvoices(): Observable<Invoice[]> {
    console.log('📡 Fetching invoices from JSON...');
    return this.http.get<Invoice[]>(this.dataUrl).pipe(
      catchError((error) => {
        console.error('🔥 Error fetching invoices:', error);
        return throwError(() => error);
      })
    );
  }

  // Add methods later for add/update/delete
}
