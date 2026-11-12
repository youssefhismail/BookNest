import { AfterViewInit, Component, ElementRef, inject, OnDestroy, signal, ViewChild } from '@angular/core';
import { BooknestService } from '../booknest.service';
import Chart from 'chart.js/auto';

@Component({
  standalone: true,
  template: `
    <section class="page-intro"><div><span class="eyebrow">BOOKNEST · FINANCE</span><h1>Good things <em>add up.</em></h1><p>A clear view of what each part of BookNest brings in and what it takes to grow.</p></div><button class="button button-outline" (click)="download()">↓ Export monthly report</button></section>
    <section class="finance-kpis"><article class="finance-kpi"><span>TOTAL INCOME</span><strong>{{store.format(store.totalIncome())}}</strong><small>Across all departments</small><div class="sparkline spark-up"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></article><article class="finance-kpi"><span>TOTAL EXPENSES</span><strong>{{store.format(store.totalExpense())}}</strong><small>Across all departments</small><div class="sparkline"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></article><article class="finance-kpi"><span>NET CONTRIBUTION</span><strong>{{store.format(store.totalIncome() - store.totalExpense())}}</strong><small>Income less department expenses</small><div class="kpi-orbit">✳</div></article></section>
    <section class="finance-chart-grid"><article class="content-card chart-card"><div class="card-heading"><div><span class="eyebrow">OCTOBER 2026</span><h2>Income & expenses</h2></div><span class="legend"><i class="legend-income"></i> Income <i class="legend-expense"></i> Expenses</span></div><div class="chart-area"><canvas #budgetChart role="img" aria-label="Bar chart comparing October income and expenses by department"></canvas></div><div class="chart-footnote"><span class="status-dot"></span> @if (canEditBudget()) { Select a department and edit its figures. } @else { Read-only department budget view. }</div></article><article class="content-card department-detail"><span class="eyebrow">DEPARTMENT SNAPSHOT</span><h2>{{selectedDepartment().name}}</h2><p>October 2026 · Monthly overview</p><div class="detail-stat"><label><i class="legend-income"></i> Income @if (canEditBudget()) { <input type="number" min="0" [value]="selectedDepartment().income" (change)="updateSelected('income',$any($event.target).valueAsNumber)" aria-label="Department income"> }</label><strong>{{store.format(selectedDepartment().income)}}</strong></div><div class="detail-stat"><label><i class="legend-expense"></i> Expenses @if (canEditBudget()) { <input type="number" min="0" [value]="selectedDepartment().expense" (change)="updateSelected('expense',$any($event.target).valueAsNumber)" aria-label="Department expenses"> }</label><strong>{{store.format(selectedDepartment().expense)}}</strong></div><div class="detail-net"><span>Net contribution</span><strong>{{store.format(selectedDepartment().income - selectedDepartment().expense)}}</strong></div><div class="progress-track"><i [style.width.%]="expensePercent()"></i></div><small class="progress-caption">{{expensePercent().toFixed(0)}}% of income used</small></article></section>
    <section class="content-card department-list"><div class="card-heading"><div><span class="eyebrow">WHERE WE GROW</span><h2>Department breakdown</h2></div><span class="table-count">{{store.departments().length}} departments</span></div>@for (item of store.departments(); track item.name) { <button class="department-row" (click)="selected.set(item.name)"><span class="dept-icon" [style.background]="item.color + '20'" [style.color]="item.color">{{item.icon}}</span><span class="dept-name"><strong>{{item.name}}</strong><small>Monthly budget</small></span><span class="dept-values"><strong>{{store.format(item.income)}}</strong><small>income</small></span><span class="dept-values"><strong>{{store.format(item.expense)}}</strong><small>expenses</small></span><span class="dept-net">+{{store.format(item.income-item.expense)}}</span><span class="row-arrow">→</span></button> }</section>
  `
})
export class FinancePage implements AfterViewInit, OnDestroy {
  protected readonly store = inject(BooknestService);
  @ViewChild('budgetChart') private budgetCanvas!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  readonly selected = signal('Workshops');
  constructor() { this.store.pageTitle('Department budgets'); }
  canEditBudget() { return this.store.currentUser()?.role === 'accountant'; }
  ngAfterViewInit() {
    this.chart = new Chart(this.budgetCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: this.store.departments().map(item => item.name),
        datasets: [
          { label: 'Income', data: this.store.departments().map(item => item.income), backgroundColor: '#819477', borderRadius: 5, borderSkipped: false, barPercentage: .72, categoryPercentage: .64 },
          { label: 'Expenses', data: this.store.departments().map(item => item.expense), backgroundColor: '#e3b08d', borderRadius: 5, borderSkipped: false, barPercentage: .72, categoryPercentage: .64 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        onClick: (_event, elements) => { if (elements.length) this.selected.set(this.store.departments()[elements[0].index].name); },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: context => `${context.dataset.label}: ${this.store.format(Number(context.raw))}` } } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#838a80', font: { family: 'DM Sans', size: 9 } } },
          y: { beginAtZero: true, suggestedMax: 150000, ticks: { color: '#a3a69e', font: { family: 'DM Sans', size: 8 }, callback: value => Number(value) === 0 ? '0' : `${Number(value) / 1000}k` }, grid: { color: '#efefe9' } },
        },
      },
    });
  }
  ngOnDestroy() { this.chart?.destroy(); }
  selectedDepartment() { return this.store.departments().find(item => item.name === this.selected()) ?? this.store.departments()[0]; }
  expensePercent() { const department = this.selectedDepartment(); return department.income ? Math.min(100, department.expense / department.income * 100) : 0; }
  updateSelected(field: 'income' | 'expense', amount: number) {
    if (!this.canEditBudget()) return;
    this.store.updateDepartment(this.selectedDepartment().name, field, amount);
    if (this.chart) {
      this.chart.data.datasets[0].data = this.store.departments().map(item => item.income);
      this.chart.data.datasets[1].data = this.store.departments().map(item => item.expense);
      this.chart.update();
    }
  }
  download() {
    const report = { month: '2026-10', currency: 'EGP', generatedAt: new Date().toISOString(), totals: { income: this.store.totalIncome(), expenses: this.store.totalExpense(), net: this.store.totalIncome() - this.store.totalExpense() }, departments: this.store.departments() };
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })); link.download = 'booknest-monthly-finance-2026-10.json'; link.click(); URL.revokeObjectURL(link.href);
  }
}
