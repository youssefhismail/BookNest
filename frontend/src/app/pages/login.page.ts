import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BooknestService } from '../booknest.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout"><section class="auth-story"><a routerLink="/" class="auth-brand"><span class="brand-mark">b<span>.</span></span> booknest</a><div><span class="eyebrow">A LITTLE SPACE TO GROW</span><h1>Welcome back<br>to your <em>next chapter.</em></h1><p>Your workshops, favorite books and little wins are right where you left them.</p></div><div class="auth-quote"><span>“</span><p>Books are a uniquely portable magic.</p><small>STEPHEN KING</small></div><div class="auth-story-foot">READ · LEARN · GROW <span>✳</span></div></section><section class="auth-form-side"><div class="auth-form-wrap"><span class="eyebrow">YOUR BOOKNEST</span><h2>Sign in</h2><p class="auth-lead">Use your username and password to open your BookNest space.</p>
      @if (errorMessage()) { <div class="form-error" role="alert">{{errorMessage()}}</div> }
      <form [formGroup]="form" (ngSubmit)="submit()"><label>Username<input formControlName="username" placeholder="Your username" autocomplete="username"></label><label>Password<input type="password" formControlName="password" placeholder="Your password" autocomplete="current-password"></label><button class="button button-dark auth-submit" type="submit" [disabled]="form.invalid">Sign in to BookNest <span>↗</span></button></form><p class="auth-switch">New around here? <a routerLink="/signup">Create a student account</a></p><div class="demo-note"><span>✳</span><p><strong>Demo sign-in</strong><br>Student: <b>reader</b> · password <b>booknest-demo</b><br>Staff: <b>accountant</b> or <b>admin</b> · password <b>booknest-demo</b></p></div><a routerLink="/" class="back-link">← Back to BookNest</a></div></section></div>
  `
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(BooknestService);
  readonly errorMessage = signal('');
  readonly form = this.fb.nonNullable.group({ username: ['', [Validators.required, Validators.minLength(3)]], password: ['', [Validators.required, Validators.minLength(8)]] });
  constructor() { this.store.pageTitle('Sign in'); }
  submit() {
    if (this.form.invalid) return;
    const { username, password } = this.form.getRawValue();
    const user = this.store.authenticate(username, password);
    if (!user) { this.errorMessage.set('We could not match that username and password. Check them and try again.'); return; }
    this.router.navigateByUrl(user.role === 'accountant' || user.role === 'admin' ? '/finance' : '/fees');
  }
}
