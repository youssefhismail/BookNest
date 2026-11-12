import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BooknestService, Product } from '../booknest.service';

@Component({
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <section class="page-intro shop-intro"><div><span class="eyebrow">THE BOOKNEST BOOKSHOP</span><h1>A shelf for <em>every season.</em></h1><p>Books, e-books and little desk companions, picked with care.</p></div><div class="shop-basket"><span>YOUR BAG</span><strong>{{store.cartCount() | number:'2.0'}}</strong><small>{{cartTotal() ? store.format(cartTotal()) : 'lovely things'}}</small>@if (store.cartCount()) { <button class="button button-dark button-small" (click)="checkout()">Checkout ↗</button> }</div></section>
    @if (ordered()) { <div class="success-banner"><span>✳</span><div><strong>Your order is tucked in!</strong><small>Order {{orderNumber}} · Your happy little melody is playing.</small></div><button class="icon-button" (click)="ordered.set(false)" aria-label="Dismiss">×</button></div> }
    <section class="shop-toolbar"><div class="filter-pills" role="group" aria-label="Filter products">@for (filter of filters; track filter) { <button class="filter-pill" [class.selected]="activeFilter() === filter" (click)="activeFilter.set(filter)">{{filter}}</button> }</div><span class="results-count">{{filteredProducts().length}} lovely finds</span></section>
    <section class="product-grid">
      @for (product of filteredProducts(); track product.id) {
        <article class="product-card"><div class="product-visual cover-{{product.color}}"><span class="product-kind">{{product.kind}}</span><button class="heart-button" [class.loved]="store.isWishlisted(product.id)" (click)="store.toggleWishlist(product.id)" [attr.aria-label]="store.isWishlisted(product.id) ? 'Remove from wishlist' : 'Add to wishlist'">{{store.isWishlisted(product.id) ? '♥' : '♡'}}</button><div class="book-cover product-cover"><span>BOOKNEST<br>READING LIST</span><b>{{product.mark}}</b></div><span class="cover-shadow"></span></div><div class="product-info"><div><h3>{{product.title}}</h3><p>{{product.author}}</p>@if (product.kind !== 'E-book') { <small class="stock-hint">{{store.stockFor(product)}} in stock</small> }</div><strong>{{store.format(product.price)}}</strong></div><button class="button button-outline add-button" [disabled]="product.kind !== 'E-book' && store.stockFor(product) === 0" (click)="add(product)">{{product.kind !== 'E-book' && store.stockFor(product) === 0 ? 'Out of stock' : 'Add to bag'}} <span>＋</span></button></article>
      } @empty { <div class="empty-state"><span>✧</span><h3>Nothing on this shelf yet.</h3><p>Try another category to find your next read.</p></div> }
    </section>
    <section class="shop-bottom"><div><span class="eyebrow">YOUR WISHLIST</span><strong>{{store.wishlist().length}} saved for later</strong></div><p>Your saved books stay here on this device, ready when you are.</p></section>
  `
})
export class ShopPage {
  protected readonly store = inject(BooknestService);
  readonly filters = ['Everything', 'Books', 'E-books', 'Stationery'];
  readonly activeFilter = signal('Everything');
  readonly ordered = signal(false);
  orderNumber = '2851';
  constructor() { this.store.pageTitle('Bookshop'); }
  filteredProducts() {
    const filter = this.activeFilter();
    if (filter === 'Everything') return this.store.catalog();
    return this.store.catalog().filter(product => product.kind === filter.replace('E-books', 'E-book').replace('Books', 'Book'));
  }
  add(product: Product) {
    this.store.addToCart(product.id);
  }
  cartTotal() { return this.store.cart().reduce((sum, id) => sum + (this.store.catalog().find(product => product.id === id)?.price ?? 0), 0); }
  checkout() {
    const order = this.store.checkoutCart();
    if (!order) return;
    this.ordered.set(true); this.orderNumber = order.id; this.playNote();
  }
  private playNote() {
    try {
      const audio = new AudioContext();
      [659, 784, 988].forEach((frequency, index) => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = 'sine'; oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, audio.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.08, audio.currentTime + index * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + index * 0.12 + 0.32);
        oscillator.connect(gain); gain.connect(audio.destination);
        oscillator.start(audio.currentTime + index * 0.12); oscillator.stop(audio.currentTime + index * 0.12 + 0.34);
      });
      window.setTimeout(() => void audio.close(), 800);
    } catch { /* Audio is a small optional confirmation effect. */ }
  }
}
