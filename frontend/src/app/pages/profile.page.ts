import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooknestService } from '../booknest.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (store.currentUser(); as user) {
      <section class="page-intro"><div><span class="eyebrow">YOUR BOOKNEST</span><h1>A space that feels <em>like yours.</em></h1><p>Your profile, reading list, and bookshop history in one place.</p></div></section>
      <section class="profile-layout"><article class="content-card profile-card"><div class="profile-cover"><span>✳</span></div><div class="profile-portrait">@if (user.picture) { <img [src]="user.picture" alt="Profile picture"> } @else { {{store.avatarInitials()}} }</div><div class="profile-name"><h2>{{user.name}}</h2><p>{{user.email}}</p><span class="role-chip">{{user.role}}</span></div><div class="profile-details"><div><small>USERNAME</small><strong>{{user.username}}</strong></div><div><small>READING INTEREST</small><strong>{{user.preference || 'Stories & creativity'}}</strong></div><div><small>DEMO PAYMENT CARD</small><strong>•••• •••• •••• {{cardLastFour() || '0000'}}</strong></div><div><small>ACCOUNT</small><strong>Demo profile · this device</strong></div></div><div class="profile-privacy">✳ &nbsp;Your profile and preferences are stored on this device for the coursework demo.</div></article><div class="profile-side"><article class="content-card profile-reading"><div class="card-heading"><div><span class="eyebrow">SAVED FOR LATER</span><h2>Your wishlist</h2></div><span class="table-count">{{store.wishlist().length}} items</span></div>@if (savedProducts().length) { @for (product of savedProducts(); track product.id) { <div class="saved-book"><div class="mini-cover cover-{{product.color}}">{{product.mark}}</div><span><strong>{{product.title}}</strong><small>{{product.author}}</small></span><button class="icon-button" (click)="store.toggleWishlist(product.id)" aria-label="Remove saved book">×</button></div> } } @else { <div class="empty-small"><span>♡</span><p>Books you save in the shop will find a home here.</p></div> }</article><article class="content-card profile-orders"><div class="card-heading"><div><span class="eyebrow">THE LITTLE THINGS YOU BOUGHT</span><h2>Order history</h2></div></div>@if (store.orders().length) { @for (order of store.orders(); track order.id) { <div class="order-row"><span class="order-icon">▤</span><span><strong>{{order.id}}</strong><small>{{order.date}} · {{order.productIds.length}} items</small></span><strong>{{store.format(order.total)}}</strong></div> } } @else { <div class="empty-small"><span>✧</span><p>Your first bookshop order will show up here.</p></div> }</article></div></section>
    } @else {
      <section class="guest-profile"><span class="not-found-mark">✳</span><span class="eyebrow">YOUR BOOKNEST PROFILE</span><h1>Your little corner is <em>waiting.</em></h1><p>Sign in to see your details, reading preferences, wishlist and order history.</p><div><a class="button button-dark" routerLink="/login">Sign in <span>↗</span></a><a class="button button-outline" routerLink="/signup">Create an account</a></div></section>
    }
  `
})
export class ProfilePage {
  protected readonly store = inject(BooknestService);
  constructor() { this.store.pageTitle('My profile'); }
  cardLastFour() {
    const username = this.store.currentUser()?.username;
    return this.store.accounts().find(account => account.username === username)?.cardLastFour;
  }
  savedProducts() { return this.store.catalog().filter(product => this.store.wishlist().includes(product.id)); }
}
