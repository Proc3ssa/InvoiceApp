import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Invoice } from '../models/invoice.model';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private dataUrl = '/assets/data/data.json';
  private invoicesSubject = new BehaviorSubject<Invoice[]>([]);
  public invoices$ = this.invoicesSubject.asObservable();
  private localStorageKey = 'invoices';

  constructor(private http: HttpClient) {
    this.loadInvoices();
  }

  private loadInvoices(): void {
    const storedInvoices = localStorage.getItem(this.localStorageKey);
    if (storedInvoices) {
      this.invoicesSubject.next(JSON.parse(storedInvoices));
      console.log('📦 Invoices loaded from local storage.');
    } else {
      this.fetchInvoicesFromJSON();
    }
  }

  private fetchInvoicesFromJSON(): void {
    console.log('📡 Fetching invoices from JSON...');
    this.http.get<Invoice[]>(this.dataUrl).pipe(
      catchError((error) => {
        console.error('🔥 Error fetching invoices:', error);
        return throwError(() => error);
      })
    ).subscribe(invoices => {
      this.invoicesSubject.next(invoices);
      this.saveInvoicesToLocalStorage(invoices);
    });
  }

  private saveInvoicesToLocalStorage(invoices: Invoice[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(invoices));
    console.log('💾 Invoices saved to local storage.');
  }

  getInvoices(): Observable<Invoice[]> {
    return this.invoices$;
  }

  addInvoice(invoice: Invoice): void {
    const currentInvoices = this.invoicesSubject.getValue();
    const updatedInvoices = [...currentInvoices, invoice];
    this.invoicesSubject.next(updatedInvoices);
    this.saveInvoicesToLocalStorage(updatedInvoices);
  }

  deleteInvoice(invoiceId: string): void {
    const currentInvoices = this.invoicesSubject.getValue();
    const updatedInvoices = currentInvoices.filter(invoice => invoice.id !== invoiceId);
    this.invoicesSubject.next(updatedInvoices);
    this.saveInvoicesToLocalStorage(updatedInvoices);
  }

  updateInvoice(invoice: Invoice): void {
    const currentInvoices = this.invoicesSubject.getValue();
    const updatedInvoices = currentInvoices.map(inv => inv.id === invoice.id ? invoice : inv);
    this.invoicesSubject.next(updatedInvoices);
    this.saveInvoicesToLocalStorage(updatedInvoices);
  }

}
