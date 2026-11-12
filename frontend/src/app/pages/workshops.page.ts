import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BooknestService } from '../booknest.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page-intro workshop-intro"><div><span class="eyebrow">THE BOOKNEST ACADEMY</span><h1>Find your people.<br><em>Find your practice.</em></h1><p>Friendly small-group workshops for thoughtful readers and curious writers.</p></div><div class="workshop-side-note"><span>✳</span><strong>Small groups,<br>gentle guidance.</strong><small>Limited seats · real conversation</small></div></section>
    @if (notice()) { <div class="success-banner"><span>✓</span><div><strong>{{notice()}}</strong><small>{{noticeDetail()}}</small></div><a routerLink="/fees" class="table-action">View fees →</a></div> }
    <section class="workshop-grid">@for (course of store.workshops; track course.title) { <article class="workshop-card"><div class="workshop-artwork art-{{course.color}}"><span class="workshop-tag">{{course.tag}}</span><span class="workshop-illustration">{{course.art}}</span><span class="art-stamp">BOOK<br>NEST<br>ACADEMY</span></div><div class="workshop-card-body"><div class="workshop-schedule"><span>◷ {{course.date}}</span><span>{{course.schedule}}</span></div><h2>{{course.title}}</h2><p>{{course.description}}</p><div class="workshop-card-foot"><div><strong>{{store.format(course.fee)}}</strong><small>course fee · {{course.seats}} seats left</small></div>@if (store.enrollments().includes(course.title)) { @if (store.currentUser()?.role === 'student') { <button class="button button-outline button-small" (click)="unenroll(course.title)">Unenroll</button> } @else { <span class="enrolled-pill">✓ Enrolled</span> } } @else if (store.currentUser()?.role === 'student') { <button class="button button-dark button-small" (click)="enroll(course.title)">Enroll <span>↗</span></button> } @else { <a class="button button-outline button-small" routerLink="/signup">Join to enroll <span>↗</span></a> }</div></div></article> }</section>
    <section class="workshop-bottom"><span>✳</span><div><strong>Wondering which workshop feels right?</strong><p>Our reading helper can suggest books to go with the courses on your list.</p></div><button class="button button-outline button-small" (click)="openHelper()">Ask the reading helper →</button></section>
  `
})
export class WorkshopsPage {
  protected readonly store = inject(BooknestService);
  readonly notice = signal('');
  readonly noticeDetail = signal('');
  constructor() { this.store.pageTitle('Workshops'); }
  enroll(title: string) {
    if (!this.store.enrollCourse(title)) return;
    this.notice.set('You’re on the list!');
    this.noticeDetail.set('Your workshop enrollment is saved to your profile, and a course fee has been added.');
  }
  unenroll(title: string) {
    if (!this.store.unenrollCourse(title)) return;
    this.notice.set('You’ve left the workshop.');
    this.noticeDetail.set('Your enrollment was removed. Any course fee already issued remains in your fee history.');
  }
  openHelper() { this.store.helperOpen.set(true); }
}
