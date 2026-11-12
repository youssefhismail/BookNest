import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooknestService } from '../booknest.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home-page">
      <section class="hero-panel">
        <div class="hero-copy">
          <span class="eyebrow"><span class="eyebrow-dot"></span> A PLACE TO GROW THROUGH STORIES</span>
          <h1>Find your next<br><em>good thing.</em></h1>
          <p>A little bookshop, a lot of room to grow. Explore thoughtful reads and workshops made for curious minds.</p>
          <div class="hero-buttons"><a routerLink="/shop" class="button button-dark">Explore the bookshop <span>↗</span></a><a routerLink="/workshops" class="button button-light">Join a workshop</a></div>
          <div class="hero-social"><span class="avatar-stack"><i>R</i><i>M</i><i>N</i><i>+</i></span><span><strong>1,200+</strong> curious readers and writers</span></div>
        </div>
        <div class="hero-art" aria-label="Illustration of books and a plant">
          <div class="sun-shape"></div><div class="art-caption">A softer place<br>to land ✳</div>
          <div class="plant"><i></i><i></i><i></i><b></b></div>
          <div class="book-stack"><div class="book book-one"><span>THE ART OF<br>NOTICING</span><i>✳</i></div><div class="book book-two"><span>Small Things<br>Like These</span></div><div class="book book-three"><span>read a little<br>every day</span></div></div>
          <span class="sparkle sparkle-one">✳</span><span class="sparkle sparkle-two">✦</span><span class="floating-note">stories for<br>your season</span>
        </div>
      </section>

      <section class="welcome-row"><div><span class="eyebrow">YOUR LITTLE CORNER OF THE INTERNET</span><h2>Good things are growing here.</h2></div><p>Pick up a new skill, meet a new favorite character, or make a little space for your own words.</p></section>
      <section class="feature-grid">
        <a routerLink="/shop" class="feature-card feature-shop"><span class="feature-icon">▤</span><span class="feature-arrow">↗</span><small>THE BOOKSHOP</small><h3>Stories that<br>stay with you.</h3><p>Handpicked books, e-books, and desk companions for your next chapter.</p><span class="text-link">Browse the shelves <b>→</b></span><div class="mini-books"><i></i><i></i><i></i></div></a>
        <a routerLink="/workshops" class="feature-card feature-workshop"><span class="feature-icon">✳</span><span class="feature-arrow">↗</span><small>THE ACADEMY</small><h3>Make room<br>to make things.</h3><p>Friendly workshops that help your ideas find their voice.</p><span class="text-link">Find your workshop <b>→</b></span><div class="workshop-art">✿</div></a>
        <div class="quote-card"><span class="quote-mark">“</span><blockquote>There is no such thing as too many books, only not enough shelves.</blockquote><small>A BOOKNEST KIND OF THOUGHT</small><div class="quote-flower">✳</div></div>
      </section>

      <section class="section-heading"><div><span class="eyebrow">A FEW THINGS WE LOVE</span><h2>Currently on our shelves</h2></div><a routerLink="/shop" class="text-link">See the whole shop <b>→</b></a></section>
      <section class="home-products">
        @for (product of store.catalog().slice(0, 4); track product.id) {
          <a routerLink="/shop" class="home-product"><div class="book-cover cover-{{product.color}}"><span>BOOKNEST<br>READING LIST</span><b>{{product.mark}}</b></div><div class="home-product-meta"><small>{{product.kind}}</small><strong>{{product.title}}</strong><span>{{store.format(product.price)}}</span></div></a>
        }
      </section>
      <section class="bottom-note"><span class="bottom-note-icon">✳</span><div><strong>Small steps, lovely stories.</strong><p>Come as you are. Leave with something good.</p></div><a routerLink="/signup" class="button button-dark button-small">Get started <span>↗</span></a></section>
    </div>
  `
})
export class HomePage {
  protected readonly store = inject(BooknestService);
  constructor() { this.store.pageTitle('Overview'); }
}
