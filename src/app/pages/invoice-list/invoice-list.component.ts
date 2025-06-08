// === invoice-list.component.ts ===
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { Subscription } from 'rxjs';
import { NewInvoiceFormComponent } from '../new-invoice-form/new-invoice-form.component';
import { DueDatePipe } from '../../shared/due-date.pipe';
import { HighlightOverdueDirective } from '../../shared/highlight-overdue.directive';
import { Sidebar } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NewInvoiceFormComponent,
    Sidebar,
    DueDatePipe,
    HighlightOverdueDirective
  ],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.scss']
})
export class InvoiceListComponent implements OnInit, OnDestroy {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  isNewModalOpen = false;
  selectedStatus: string = 'all';
  private invoicesSubscription!: Subscription;

  constructor(
    private invoiceService: InvoiceService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.invoicesSubscription = this.invoiceService.getInvoices().subscribe((data) => {
      this.invoices = data;
      this.applyFilter();
    });

    this.route.url.subscribe(() => {
      this.isNewModalOpen = this.router.url.endsWith('/new');
    });
  }

  toggleTheme(): void {
    document.body.classList.toggle('dark-theme');
  }

  onFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.setFilter(value);
  }

  applyFilter() {
    if (this.selectedStatus === 'all') {
      this.filteredInvoices = this.invoices;
    } else {
      this.filteredInvoices = this.invoices.filter(
        inv => inv.status === this.selectedStatus
      );
    }
  }

  setFilter(status: string) {
    this.selectedStatus = status;
    this.applyFilter();
  }

  deleteInvoice(id: string) {
    this.invoices = this.invoices.filter(inv => inv.id !== id);
  }

  ngOnDestroy(): void {
    if (this.invoicesSubscription) {
      this.invoicesSubscription.unsubscribe();
    }
  }

  closeModal() {
    this.router.navigate(['/invoices']);
  }

  handleInvoiceSaved(newInvoice: Invoice) {
    const index = this.invoices.findIndex(inv => inv.id === newInvoice.id);

    if (index !== -1) {
      this.invoices[index] = newInvoice;
    } else {
      this.invoices.push(newInvoice);
    }

    this.applyFilter();
    this.closeModal();
  }
}
