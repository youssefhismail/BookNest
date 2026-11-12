import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BooknestService, Product } from '../booknest.service';

@Component({
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule],
  template: `
    <section class="page-intro"><div><span class="eyebrow">ADMIN · BOOKSHOP</span><h1>Keep the shelves <em>in good shape.</em></h1><p>Update stock counts and spot the items that need a little restock.</p></div><button class="button button-outline" (click)="downloadStock()">↓ Export stock list</button></section>
    @if (addedNotice()) { <div class="success-banner"><span>✓</span><div><strong>Product added to the shelves</strong><small>It is available in the bookshop and inventory list.</small></div></div> }
    @if (removedNotice()) { <div class="success-banner"><span>✓</span><div><strong>Product removed</strong><small>It was removed from the catalog, cart and wishlist on this device.</small></div></div> }
    <section class="content-card inventory-add-card"><div><span class="eyebrow">ADD SOMETHING NEW</span><h2>New product</h2><p>Add a book, e-book, or stationery item to the catalog.</p></div><form [formGroup]="productForm" (ngSubmit)="addProduct()"><label>Product name<input formControlName="title" placeholder="A lovely new read"></label><label>Author or maker<input formControlName="author" placeholder="Name"></label><label>Type<select formControlName="kind"><option>Book</option><option>E-book</option><option>Stationery</option></select></label><label>Price<input type="number" min="1" formControlName="price"></label><label>Starting stock<input type="number" min="0" formControlName="stock" [disabled]="productForm.controls.kind.value === 'E-book'"></label><button class="button button-dark button-small" type="submit" [disabled]="productForm.invalid">Add product <span>↗</span></button></form></section>
    <section class="inventory-kpis"><article><span>PRODUCTS IN CATALOG</span><strong>{{store.catalog().length | number:'2.0'}}</strong><small>Books, e-books & stationery</small></article><article><span>LOW STOCK</span><strong>{{lowStockCount() | number:'2.0'}}</strong><small>5 or fewer remaining</small></article><article><span>CATALOG VALUE</span><strong>{{store.format(catalogValue())}}</strong><small>Retail value of current stock</small></article></section>
    <section class="content-card inventory-card"><div class="card-heading"><div><span class="eyebrow">PRODUCT CATALOG</span><h2>Stock on hand</h2></div><span class="table-count">Saved in this browser</span></div><div class="table-scroll"><table><thead><tr><th>PRODUCT</th><th>TYPE</th><th>PRICE</th><th>STOCK STATUS</th><th>QUANTITY</th><th>UPDATE STOCK</th><th></th></tr></thead><tbody>@for (product of store.catalog(); track product.id) { <tr><td><div class="inventory-product"><span class="inventory-cover cover-{{product.color}}">{{product.mark}}</span><span><strong>{{product.title}}</strong><small>{{product.author}}</small></span></div></td><td>{{product.kind}}</td><td>{{store.format(product.price)}}</td><td>@if (product.kind === 'E-book') { <span class="stock-pill">Digital</span> } @else { <span class="stock-pill" [class.stock-low]="store.stockFor(product) <= 5"><i></i>{{store.stockFor(product) <= 5 ? 'Restock soon' : 'In stock'}}</span> }</td><td class="stock-qty">{{product.kind === 'E-book' ? '∞' : store.stockFor(product)}}</td><td>@if (product.kind === 'E-book') { <span class="table-count">No physical stock</span> } @else { <div class="stock-controls"><button (click)="store.adjustStock(product,-1)" [disabled]="store.stockFor(product) <= 0" [attr.aria-label]="'Remove one ' + product.title">−</button><button (click)="store.adjustStock(product,1)" [attr.aria-label]="'Add one ' + product.title">+</button></div> }</td><td><button class="product-remove" (click)="removeProduct(product)" [attr.aria-label]="'Remove ' + product.title">Remove</button></td></tr> }</tbody></table></div><div class="table-note"><span>ⓘ</span> Product removals and stock changes are saved in this browser for the front-end demo.</div></section>
  `
})
export class InventoryPage {
  protected readonly store = inject(BooknestService);
  private readonly fb = inject(FormBuilder);
  readonly addedNotice = signal(false);
  readonly removedNotice = signal(false);
  readonly productForm = this.fb.nonNullable.group({ title: ['', Validators.required], author: ['', Validators.required], kind: ['Book' as Product['kind']], price: [1, [Validators.required, Validators.min(1)]], stock: [1, [Validators.required, Validators.min(0)]] });
  constructor() { this.store.pageTitle('Stock & products'); }
  addProduct() {
    if (this.productForm.invalid) return;
    this.store.createProduct(this.productForm.getRawValue());
    this.productForm.reset({ title: '', author: '', kind: 'Book', price: 1, stock: 1 });
    this.addedNotice.set(true);
    this.removedNotice.set(false);
  }
  removeProduct(product: Product) {
    if (!window.confirm('Remove "' + product.title + '" from the BookNest catalog?')) return;
    if (this.store.removeProduct(product.id)) {
      this.removedNotice.set(true);
      this.addedNotice.set(false);
    }
  }
  lowStockCount() { return this.store.catalog().filter(product => product.kind !== 'E-book' && this.store.stockFor(product) <= 5).length; }
  catalogValue() { return this.store.catalog().filter(product => product.kind !== 'E-book').reduce((total, product) => total + this.store.stockFor(product) * product.price, 0); }
  downloadStock() {
    const rows = this.store.catalog().map(product => ({ id: product.id, title: product.title, kind: product.kind, price: product.price, stock: product.kind === 'E-book' ? 'unlimited' : this.store.stockFor(product) }));
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })); link.download = 'booknest-stock-list.json'; link.click(); URL.revokeObjectURL(link.href);
  }
}
