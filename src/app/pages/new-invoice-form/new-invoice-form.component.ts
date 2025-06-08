// === new-invoice-form.component.ts ===
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../models/invoice.model';
import { IonicModule } from '@ionic/angular';
import { InvoiceService } from '../../services/invoice.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-new-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonicModule],
  templateUrl: './new-invoice-form.component.html',
  styleUrls: ['./new-invoice-form.component.scss']
})
export class NewInvoiceFormComponent implements OnChanges {
  @Input() formData?: Invoice;
  @Output() close = new EventEmitter<Invoice>(); // emit Invoice instead of void

  invoiceForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService
  ) {
    this.invoiceForm = this.fb.group({
      senderAddress: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postCode: ['', Validators.required],
        country: ['', Validators.required],
      }),
      clientName: ['', Validators.required],
      clientEmail: ['', [Validators.required, Validators.email]],
      clientAddress: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postCode: ['', Validators.required],
        country: ['', Validators.required],
      }),
      createdAt: ['', Validators.required],
      paymentDue: ['', Validators.required],
      description: ['', Validators.required],
      paymentTerms: [1, Validators.required],
      status: ['draft', Validators.required],
      items: new FormArray<FormGroup>([this.createItem()]),
      total: [{ value: 0, disabled: true }],
      id: [''] // add id for edit support
    });

    this.items.valueChanges.subscribe(() => {
      this.updateTotal();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formData'] && this.formData) {
      this.patchForm(this.formData);
    }
  }

  get items(): FormArray<FormGroup> {
    return this.invoiceForm.get('items') as FormArray<FormGroup>;
  }

  createItem(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]],
      total: [{ value: 0, disabled: true }]
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    this.items.removeAt(index);
    this.updateTotal();
  }

  updateTotal() {
    let total = 0;
    this.items.controls.forEach(item => {
      const quantity = item.get('quantity')?.value || 0;
      const price = item.get('price')?.value || 0;
      const itemTotal = quantity * price;
      item.get('total')?.setValue(itemTotal, { emitEvent: false });
      total += itemTotal;
    });
    this.invoiceForm.get('total')?.setValue(total, { emitEvent: false });
  }

  patchForm(data: Invoice) {
    this.invoiceForm.patchValue({
      ...data,
      total: data.total || 0
    });

    const itemsFormArray = new FormArray<FormGroup>([]);
    data.items.forEach(item => {
      const group = this.fb.group({
        name: [item.name, Validators.required],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]],
        price: [item.price, [Validators.required, Validators.min(0)]],
        total: [{ value: item.total, disabled: true }]
      });
      itemsFormArray.push(group);
    });

    this.invoiceForm.setControl('items', itemsFormArray);
    this.updateTotal();
  }

  onSubmit() {
   if (this.invoiceForm.valid) {
     const submittedData = this.invoiceForm.getRawValue() as Invoice;
     submittedData.id = uuidv4();
     localStorage.removeItem('invoiceDraft');
     this.invoiceService.addInvoice(submittedData);
     this.close.emit(submittedData);
    } else {
      this.invoiceForm.markAllAsTouched();
    }
  }
}
