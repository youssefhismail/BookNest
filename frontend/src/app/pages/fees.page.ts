import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooknestService } from '../booknest.service';

@Component({
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule],
  template: `
    <section class="page-intro"><div><span class="eyebrow">STUDENT FINANCE</span><h1>Your learning, <em>in good order.</em></h1><p>See what’s paid, what’s coming up, and keep your course journey on track.</p></div><button class="button button-outline" (click)="downloadHistory()">↓ Download history</button></section>
    @if (isStaff()) { <section class="content-card create-invoice"><div><span class="eyebrow">ACCOUNTING · STUDENT FEES</span><h2>Create an invoice</h2><p>Add a workshop or course fee to the records.</p></div><form [formGroup]="invoiceForm" (ngSubmit)="createInvoice()"><label>Course or fee<input formControlName="title" placeholder="Workshop name"></label><label>For student<select formControlName="studentUsername"><option value="*">All demo students</option><option value="reader">Maya Reader (demo)</option>@for (account of store.accounts(); track account.username) { <option [value]="account.username">{{account.name}}</option> }</select></label><label>Amount (EGP)<input formControlName="amount" type="number" min="1"></label><label>Due date<input formControlName="due" type="date"></label><button class="button button-dark button-small" type="submit" [disabled]="invoiceForm.invalid">Create invoice <span>↗</span></button></form></section> }
    @if (createdNotice()) { <div class="success-banner"><span>✓</span><div><strong>Invoice added</strong><small>The new course fee now appears in the records below.</small></div></div> }
    <section class="fee-summary-grid"><article class="summary-card summary-primary"><span>OUTSTANDING</span><strong>{{store.format(outstanding())}}</strong><small><i class="status-dot"></i> {{outstandingCount()}} invoice{{outstandingCount() === 1 ? '' : 's'}} due</small><div class="summary-decoration">▧</div></article><article class="summary-card"><span>PAID THIS TERM</span><strong>{{store.format(paidTotal())}}</strong><small>Course invoice history</small><div class="summary-icon sage-icon">✓</div></article><article class="summary-card"><span>ACTIVE WORKSHOPS</span><strong>{{store.enrollments().length | number:'2.0'}}</strong><small>Enrolled course{{store.enrollments().length === 1 ? '' : 's'}}</small><div class="summary-icon lilac-icon">✳</div></article></section>
    <section class="content-card fee-table-card"><div class="card-heading"><div><span class="eyebrow">YOUR ACCOUNT</span><h2>Course fee invoices</h2></div><span class="table-count">{{feeRows().length}} records</span></div><div class="table-scroll"><table><thead><tr><th>INVOICE</th><th>COURSE</th><th>ISSUED</th><th>DUE DATE</th><th>AMOUNT</th><th>STATUS</th><th></th></tr></thead><tbody>@for (fee of feeRows(); track fee.ref) { <tr><td class="ref-cell">{{fee.ref}}</td><td><strong>{{fee.title}}</strong></td><td>{{fee.date}}</td><td>{{fee.due}}</td><td class="amount-cell">{{store.format(fee.amount)}}</td><td><span class="status-pill" [class.status-paid]="isPaid(fee.ref)" [class.status-due]="!isPaid(fee.ref)"><i></i>{{isPaid(fee.ref) ? 'Paid' : 'Due soon'}}</span></td><td>@if (!isPaid(fee.ref)) { <button class="table-action" (click)="markPaid(fee.ref)">Mark paid →</button> } @else { <span class="muted-check">✓</span> }</td></tr> }</tbody></table></div><div class="table-note"><span>ⓘ</span> This is a course fee record for the project demo. No real payment is processed.</div></section>
    <section class="fee-bottom-grid"><article class="content-card next-class"><span class="eyebrow">UP NEXT</span><div class="class-date"><strong>18</strong><span>NOV<br>2026</span></div><div><h3>Writing with Confidence</h3><p>Tuesday · 5:30 PM · Studio 02</p><span class="class-tag">4 sessions left</span></div></article><article class="content-card fee-help"><span class="help-flower">✳</span><div><strong>Need a little help?</strong><p>Our academy team is happy to help with your invoice or course schedule.</p><a href="mailto:hello@booknest.example">Contact the academy →</a></div></article></section>
  `
})
export class FeesPage {
  protected readonly store = inject(BooknestService);
  private readonly fb = inject(FormBuilder);
  readonly createdNotice = signal(false);
  readonly invoiceForm = this.fb.nonNullable.group({ title: ['', Validators.required], studentUsername: ['*'], amount: [1, [Validators.required, Validators.min(1)]], due: ['', Validators.required] });
  constructor() { this.store.pageTitle('My fees'); }
  isPaid(ref: string) { return this.store.paidFeeRefs().includes(ref) || this.store.fees.some(fee => fee.ref === ref && fee.status === 'Paid') || this.store.extraFees().some(fee => fee.ref === ref && fee.status === 'Paid'); }
  feeRows() {
    const username = this.store.currentUser()?.username;
    const base = this.isStaff() ? this.store.fees : this.store.fees.filter(fee => fee.studentUsername === username);
    const extra = this.isStaff() ? this.store.extraFees() : this.store.extraFees().filter(fee => !fee.studentUsername || fee.studentUsername === '*' || fee.studentUsername === username);
    const visibleTitles = [...base, ...extra].map(fee => fee.title);
    const enrolled = this.store.enrollments().filter(title => !visibleTitles.includes(title)).map((title, index) => ({ ref: `BN-ENR-${String(index + 101).padStart(3, '0')}`, title, date: 'Nov 12, 2026', due: 'Nov 18, 2026', amount: this.store.workshops.find(workshop => workshop.title === title)?.fee ?? 1200, status: 'Due soon' }));
    return [...base, ...extra.map(fee => ({ ...fee, due: this.displayDate(fee.due) })), ...enrolled];
  }
  isStaff() { const role = this.store.currentUser()?.role; return role === 'accountant' || role === 'admin'; }
  createInvoice() {
    if (this.invoiceForm.invalid) return;
    this.store.createFee(this.invoiceForm.getRawValue());
    this.invoiceForm.reset({ title: '', studentUsername: '*', amount: 1, due: '' }); this.createdNotice.set(true);
  }
  outstanding() { return this.feeRows().filter(fee => !this.isPaid(fee.ref) && fee.status !== 'Paid').reduce((total, fee) => total + fee.amount, 0); }
  outstandingCount() { return this.feeRows().filter(fee => !this.isPaid(fee.ref) && fee.status !== 'Paid').length; }
  paidTotal() { return this.feeRows().filter(fee => this.isPaid(fee.ref) || fee.status === 'Paid').reduce((total, fee) => total + fee.amount, 0); }
  markPaid(ref: string) {
    this.store.markFeePaid(ref);
  }
  downloadHistory() {
    const rows = this.feeRows().map(fee => ({ ...fee, status: this.isPaid(fee.ref) || fee.status === 'Paid' ? 'Paid' : fee.status }));
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })); link.download = 'booknest-fee-history.json'; link.click(); URL.revokeObjectURL(link.href);
  }
  private displayDate(date: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }
}
