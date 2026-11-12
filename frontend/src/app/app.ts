import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BooknestService } from './booknest.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-frame">
      <aside class="sidebar">
        <a class="brand" routerLink="/" aria-label="BookNest home">
          <span class="brand-mark">b<span>.</span></span>
          <span><strong>booknest</strong><small>READ · LEARN · GROW</small></span>
        </a>
        <div class="nav-label">YOUR SPACE</div>
        <nav class="main-nav" aria-label="Main navigation">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"><span class="nav-icon">⌂</span> Overview</a>
          <a routerLink="/shop" routerLinkActive="active"><span class="nav-icon">▤</span> Bookshop <span class="nav-badge">{{ store.cartCount() }}</span></a>
          @if (store.currentUser()?.role === 'student') {
            <a routerLink="/workshops" routerLinkActive="active"><span class="nav-icon">✳</span> Workshops</a>
            <a routerLink="/fees" routerLinkActive="active"><span class="nav-icon">▧</span> My fees</a>
            <a routerLink="/profile" routerLinkActive="active"><span class="nav-icon">◉</span> My profile</a>
          }
          @if (store.currentUser()?.role === 'accountant' || store.currentUser()?.role === 'admin') {
            <div class="nav-label nav-label-spaced">MANAGEMENT</div>
            <a routerLink="/finance" routerLinkActive="active"><span class="nav-icon">⌁</span> Department budgets</a>
            <a routerLink="/payroll" routerLinkActive="active"><span class="nav-icon">▦</span> Staff payroll</a>
            <a routerLink="/fees" routerLinkActive="active"><span class="nav-icon">▧</span> Student fees</a>
            <a routerLink="/profile" routerLinkActive="active"><span class="nav-icon">◉</span> My profile</a>
          }
          @if (store.currentUser()?.role === 'admin') {
            <a routerLink="/people" routerLinkActive="active"><span class="nav-icon">♙</span> People & access</a>
            <a routerLink="/inventory" routerLinkActive="active"><span class="nav-icon">▤</span> Stock & products</a>
          }
        </nav>
        <div class="sidebar-bottom">
          <div class="help-card"><span class="help-flower">✳</span><strong>Make room for a<br>little more wonder.</strong><small>Find your next favorite read.</small><a routerLink="/shop">Explore the shop ↗</a></div>
          <div class="sidebar-user">
            <span class="avatar">{{ store.avatarInitials() }}</span>
            <span class="user-copy"><strong>{{ store.currentUser()?.name || 'Guest reader' }}</strong><small>{{ store.currentUser()?.role || 'Explore BookNest' }}</small></span>
            @if (store.currentUser()) { <button class="icon-button logout" aria-label="Sign out" title="Sign out" (click)="store.signOut()">↗</button> }
          </div>
        </div>
      </aside>

      <main class="main-area">
        <header class="topbar">
          <div class="breadcrumb"><span>BookNest</span><span class="crumb-dot">/</span><span class="crumb-current">{{ store.pageName() }}</span></div>
          <div class="top-actions">
            @if (!store.currentUser()) { <a class="button button-light button-small" routerLink="/profile">Profile</a><a class="button button-light button-small signup-top-link" routerLink="/signup">Sign up</a><a class="button button-dark button-small" routerLink="/login">Sign in <span>↗</span></a> }
            @else { <a class="button button-light button-small" routerLink="/profile">Profile</a><span class="top-user">{{ store.currentUser()?.name }} <span class="role-chip">{{ store.currentUser()?.role }}</span></span> }
          </div>
        </header>
        <section class="page-wrap"><router-outlet /></section>
        <button class="chat-launcher" (click)="store.helperOpen.update(open => !open)" [attr.aria-expanded]="store.helperOpen()" aria-label="Open BookNest reading helper"><span>✳</span><i>Reading helper</i></button>
        @if (store.helperOpen()) {
          <section class="chat-panel" aria-label="BookNest reading helper"><header><span class="chat-avatar">✳</span><span><strong>Your reading helper</strong><small>Azure AI Foundry · local demo</small></span><button class="icon-button" (click)="store.helperOpen.set(false)" aria-label="Close chat">×</button></header><div class="chat-messages"><div class="chat-bubble chat-helper">{{chatAnswer}}</div><small class="chat-context">@if (store.enrollments().length) { Based on: {{store.enrollments().join(', ')}} } @else { Join a workshop for tailored picks }</small>@if (chatStatus()) { <small class="chat-status" role="status">{{chatStatus()}}</small> }</div><form class="chat-compose" (ngSubmit)="sendChat()"><input [(ngModel)]="chatMessage" name="message" placeholder="Ask for a book recommendation…" aria-label="Message the reading helper" [disabled]="chatLoading()"><button type="submit" aria-label="Send message" [disabled]="chatLoading()">{{chatLoading() ? '…' : '↑'}}</button></form></section>
        }
        <footer class="site-footer"><span>© 2026 BookNest Academy</span><span>A little curiosity goes a long way <b>✳</b></span></footer>
      </main>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App {
  protected readonly store = inject(BooknestService);
  chatMessage = '';
  chatAnswer = 'Hi! I can suggest a book to go with what you are learning. What are you in the mood for?';
  readonly chatLoading = signal(false);
  readonly chatStatus = signal('');

  async sendChat() {
    const question = this.chatMessage.trim();
    if (!question || this.chatLoading()) return;
    this.chatMessage = '';
    if (this.isWorkshopQuestion(question)) {
      this.chatAnswer = this.workshopRecommendation(question);
      this.chatStatus.set('BookNest workshop information.');
      return;
    }
    if (!this.isBookNestQuestion(question)) {
      this.chatAnswer = 'I can help with BookNest book recommendations based on your reading interests or workshops. What kind of book are you looking for?';
      this.chatStatus.set('');
      return;
    }
    this.chatLoading.set(true);
    this.chatStatus.set('');
    const courses = this.store.enrollments().join(' ').toLowerCase();
    try {
      const response = await fetch('/foundry-config.local.json', { cache: 'no-store' });
      if (!response.ok) {
        this.chatAnswer = this.localRecommendation(courses, question);
        this.chatStatus.set('Using local sample suggestions. Add public/foundry-config.local.json to connect Foundry.');
        return;
      }
      const config = await response.json() as { endpoint?: string; model?: string; apiKey?: string };
      if (!config.endpoint?.trim() || !config.model?.trim() || !config.apiKey?.trim()) {
        this.chatAnswer = this.localRecommendation(courses, question);
        this.chatStatus.set('Foundry settings are incomplete. Check public/foundry-config.local.json.');
        return;
      }
      const endpoint = config.endpoint.trim().replace(/\/+$/, '');
      const url = endpoint.endsWith('/chat/completions') ? endpoint : `${endpoint}/chat/completions`;
      const enrollments = this.store.enrollments();
      const catalog = this.store.catalog()
        .filter(product => product.kind === 'Book' || product.kind === 'E-book')
        .map(product => ({
          id: product.id,
          title: product.title,
          author: product.author,
          kind: product.kind,
          hints: product.title === 'Small Things Like These' ? 'literary fiction, novella, story'
            : product.title === 'Bird by Bird' || product.title === 'On Writing Well' ? 'writing, craft, nonfiction'
            : product.title === 'The Creative Act' ? 'creativity, art, nonfiction'
            : product.title === 'The Art of Noticing' ? 'observation, creativity, nonfiction'
            : '',
        }));
      const foundryResponse = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': config.apiKey },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: `You are BookNest's reading helper. Select up to three books from the supplied catalog that best match the student's request and enrolled workshops. Catalog JSON: ${JSON.stringify(catalog)}. Enrolled workshops: ${enrollments.length ? enrollments.join(', ') : 'none'}. Return only a JSON object in this exact shape: {"productIds":[1,2]}. Use only numeric product IDs that appear in the catalog. Never return a title, author, explanation, markdown, or any text outside that JSON object. If no catalog book fits, return {"productIds":[]}.` },
            { role: 'user', content: question },
          ],
          max_completion_tokens: 220,
        }),
      });
      if (!foundryResponse.ok) {
        let detail = '';
        try {
          const errorBody = await foundryResponse.json() as { error?: { message?: string; code?: string } };
          detail = errorBody.error?.message || errorBody.error?.code || '';
        } catch { /* The response may not contain JSON. */ }
        throw new Error(`Foundry returned HTTP ${foundryResponse.status}${detail ? `: ${detail}` : '.'}`);
      }
      const result = await foundryResponse.json() as { choices?: Array<{ message?: { content?: string } }> };
      const rawAnswer = result.choices?.[0]?.message?.content?.trim() || '';
      const products = this.catalogProductsFromAnswer(rawAnswer, question);
      if (products.length) {
        this.chatAnswer = `From BookNest’s catalog, try ${products.map(product => `“${product.title}” by ${product.author}`).join(', ')}. These are the available titles that best match your request and workshops.`;
        this.chatStatus.set('Recommendations selected from the BookNest catalog.');
      } else {
        this.chatAnswer = this.localRecommendation(courses, question);
        this.chatStatus.set('Showing a BookNest catalog suggestion because Foundry did not return a valid catalog selection.');
      }
    } catch (error) {
      this.chatAnswer = this.localRecommendation(courses, question);
      this.chatStatus.set(`${error instanceof Error ? error.message : 'Could not reach Foundry.'} Showing local sample suggestions.`);
    } finally {
      this.chatLoading.set(false);
    }
  }

  private isBookNestQuestion(question: string) {
    const normalized = question.toLowerCase();
    const bookTopic = /\b(book|books|read|reading|reader|readers|novel|fiction|poetry|poem|story|stories|author|authors|writing|writer|writers|journal|journaling|literature|workshop|catalog|catalogue)\b/i;
    const catalogTitles = this.store.catalog().some(product => normalized.includes(product.title.toLowerCase()));
    return bookTopic.test(question) || catalogTitles;
  }

  private isWorkshopQuestion(question: string) {
    return /\b(which|what)\s+(workshop|class|course)\b|\b(workshop|class|course)\b.{0,30}\b(should i join|can i join|join|enroll|sign up|schedule|cost|fee)\b|\b(join|enroll in|sign up for)\b.{0,30}\b(workshop|class|course)\b/i.test(question);
  }

  private workshopRecommendation(question: string) {
    const workshops = this.store.workshops;
    const enrolled = new Set(this.store.enrollments().map(title => title.toLowerCase()));
    const requested = question.toLowerCase();
    const interest = /\b(read|reading|fiction|novel|story|stories)\b/.test(requested) ? 'The Reading Room'
      : /\b(journal|journaling|creative|creativity|observations)\b/.test(requested) ? 'Creative Journaling'
      : /\b(write|writing|draft|writer)\b/.test(requested) ? 'Writing with Confidence'
      : '';
    const selected = workshops.find(workshop => workshop.title === interest && !enrolled.has(workshop.title.toLowerCase()));
    if (selected) {
      return `${selected.title} sounds like a good fit: ${selected.description} It costs ${this.store.format(selected.fee)}.`;
    }
    const available = workshops.filter(workshop => !enrolled.has(workshop.title.toLowerCase()));
    if (!available.length) return 'You’re already enrolled in all the current BookNest workshops.';
    const options = available.map(workshop => `${workshop.title} (${this.store.format(workshop.fee)}): ${workshop.description}`).join(' ');
    const alreadyEnrolled = this.store.enrollments().length
      ? `You’re already enrolled in ${this.store.enrollments().join(', ')}. `
      : '';
    return `${alreadyEnrolled}Current workshops: ${options} Tell me whether you prefer reading stories or keeping a creative journal, and I’ll narrow it down.`;
  }

  private catalogProductsFromAnswer(answer: string, question: string) {
    const products = this.store.catalog().filter(product => product.kind === 'Book' || product.kind === 'E-book');
    try {
      const json = answer.match(/\{[\s\S]*\}/)?.[0];
      if (!json) return [];
      const parsed = JSON.parse(json) as { productIds?: unknown };
      if (!Array.isArray(parsed.productIds)) return [];
      const ids = new Set(parsed.productIds.filter((id): id is number => Number.isInteger(id)));
      const selected = products.filter(product => ids.has(product.id));
      if (/\b(fiction|novel|story|stories)\b/i.test(question)) {
        return selected.filter(product => product.title === 'Small Things Like These').slice(0, 3);
      }
      return selected.slice(0, 3);
    } catch {
      return [];
    }
  }

  private localRecommendation(courses: string, question = '') {
    const books = this.store.catalog().filter(product => product.kind === 'Book' || product.kind === 'E-book');
    const request = question.toLowerCase();
    const preferredTitle = /\b(fiction|novel|story|stories)\b/.test(request) ? 'Small Things Like These'
      : courses.includes('writing') ? 'Bird by Bird'
      : courses.includes('reading') ? 'Small Things Like These'
      : courses.includes('journal') || courses.includes('creative') ? 'The Creative Act'
      : 'The Art of Noticing';
    const selected = books.find(product => product.title === preferredTitle) ?? books[0];
    if (!selected) return 'There are no books in the BookNest catalog to recommend right now.';
    return `From the BookNest catalog, try “${selected.title}” by ${selected.author}.`;
  }
}

