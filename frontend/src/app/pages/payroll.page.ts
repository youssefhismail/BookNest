import { Component, inject, signal } from '@angular/core';
import { BooknestService } from '../booknest.service';

@Component({
  standalone: true,
  template: `
    <section class="page-intro"><div><span class="eyebrow">PEOPLE & PAYROLL</span><h1>Good work deserves <em>good care.</em></h1><p>Monthly staff compensation, allowances and deductions in one place. @if (!canEditPayroll()) { Payroll is read-only for admins; accountants make changes. }</p></div><button class="button button-dark" (click)="downloadReport()">↓ Export salary report <span>↗</span></button></section>
    <section class="payroll-summary"><div><span class="eyebrow">OCTOBER 2026 PAYROLL</span><strong>{{store.format(total())}}</strong><small>Net salaries · {{store.staff().length}} team members</small></div><div class="payroll-stat"><span>BASE SALARIES</span><strong>{{store.format(baseTotal())}}</strong></div><div class="payroll-stat"><span>ALLOWANCES</span><strong>{{store.format(allowances())}}</strong></div><div class="payroll-stat"><span>DEDUCTIONS</span><strong>{{store.format(deductions())}}</strong></div><span class="payroll-flower">✳</span></section>
    <section class="content-card payroll-card"><div class="card-heading"><div><span class="eyebrow">TEAM COMPENSATION</span><h2>October salary details</h2></div><span class="status-pill status-paid"><i></i>Payroll ready</span></div><div class="table-scroll"><table><thead><tr><th>TEAM MEMBER</th><th>DEPARTMENT</th><th>BASE SALARY</th><th>ALLOWANCES</th><th>DEDUCTIONS</th><th>NET PAY</th><th>STATUS</th></tr></thead><tbody>@for (staff of store.staff(); track staff.name) { <tr><td><div class="staff-person"><span class="staff-avatar">{{staff.initials}}</span><span><strong>{{staff.name}}</strong><small>{{staff.role}}</small></span></div></td><td>{{staff.dept}}</td><td>@if (canEditPayroll()) { <input class="salary-input" type="number" min="0" [value]="staff.base" (change)="updateComp(staff.name,'base',$any($event.target).valueAsNumber)" [attr.aria-label]="'Base salary for ' + staff.name"> } @else { <span class="salary-readonly">{{store.format(staff.base)}}</span> }</td><td class="allowance-cell">@if (canEditPayroll()) { <input class="salary-input" type="number" min="0" [value]="staff.allowance" (change)="updateComp(staff.name,'allowance',$any($event.target).valueAsNumber)" [attr.aria-label]="'Allowance for ' + staff.name"> } @else { <span class="salary-readonly">{{store.format(staff.allowance)}}</span> }</td><td class="deduction-cell">@if (canEditPayroll()) { <input class="salary-input" type="number" min="0" [value]="staff.deduction" (change)="updateComp(staff.name,'deduction',$any($event.target).valueAsNumber)" [attr.aria-label]="'Deduction for ' + staff.name"> } @else { <span class="salary-readonly">{{store.format(staff.deduction)}}</span> }</td><td class="amount-cell">{{store.format(staff.base + staff.allowance - staff.deduction)}}</td><td>@if (canEditPayroll()) { <button class="status-pill" [class.status-paid]="paid().includes(staff.name)" [class.status-due]="!paid().includes(staff.name)" (click)="markPaid(staff.name)"><i></i>{{paid().includes(staff.name) ? 'Paid' : 'Mark paid'}}</button> } @else { <span class="status-pill" [class.status-paid]="paid().includes(staff.name)" [class.status-due]="!paid().includes(staff.name)"><i></i>{{paid().includes(staff.name) ? 'Paid' : 'Ready'}}</span> }</td></tr> }</tbody></table></div><div class="payroll-table-footer"><span>@if (canEditPayroll()) { Showing {{store.staff().length}} active staff members · Accountant controls are enabled } @else { Showing {{store.staff().length}} active staff members · View-only } </span><strong>Total net payroll <b>{{store.format(total())}}</b></strong></div></section>
    <section class="payroll-tip"><span>✳</span><p><strong>Payroll note</strong> Allowances include workshop preparation and bookshop shift support. Salary report exports as JSON for the monthly record.</p></section>
  `
})
export class PayrollPage {
  protected readonly store = inject(BooknestService);
  readonly paid = signal<string[]>(this.readPaid());
  constructor() { this.store.pageTitle('Staff payroll'); }
  canEditPayroll() { return this.store.currentUser()?.role === 'accountant'; }
  baseTotal() { return this.store.staff().reduce((sum, person) => sum + person.base, 0); }
  allowances() { return this.store.staff().reduce((sum, person) => sum + person.allowance, 0); }
  deductions() { return this.store.staff().reduce((sum, person) => sum + person.deduction, 0); }
  total() { return this.baseTotal() + this.allowances() - this.deductions(); }
  updateComp(name: string, field: 'base' | 'allowance' | 'deduction', value: number) { if (this.canEditPayroll()) this.store.updateStaff(name, field, value); }
  markPaid(name: string) {
    if (!this.canEditPayroll()) return;
    const names = this.paid().includes(name) ? this.paid().filter(value => value !== name) : [...this.paid(), name];
    this.paid.set(names); if (typeof localStorage !== 'undefined') localStorage.setItem('booknest-payroll-paid', JSON.stringify(names));
  }
  downloadReport() {
    const report = { month: '2026-10', generatedAt: new Date().toISOString(), currency: 'EGP', totals: { base: this.baseTotal(), allowances: this.allowances(), deductions: this.deductions(), net: this.total() }, staff: this.store.staff().map(person => ({ ...person, netPay: person.base + person.allowance - person.deduction, status: this.paid().includes(person.name) ? 'Paid' : 'Ready' })) };
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })); link.download = 'booknest-payroll-2026-10.json'; link.click(); URL.revokeObjectURL(link.href);
  }
  private readPaid(): string[] {
    if (typeof localStorage === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('booknest-payroll-paid') || '[]') as string[]; } catch { return []; }
  }
}
