import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BooknestService } from '../booknest.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-layout"><section class="auth-story signup-story"><a routerLink="/" class="auth-brand"><span class="brand-mark">b<span>.</span></span> booknest</a><div><span class="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span><h1>Come as you are.<br>Leave with a <em>story.</em></h1><p>Join a community that believes small curious steps can lead to lovely places.</p></div><div class="signup-stamps"><span>READ<br>MORE</span><span>MAKE<br>THINGS</span><span>STAY<br>CURIOUS</span></div><div class="auth-story-foot">READ · LEARN · GROW <span>✳</span></div></section><section class="auth-form-side"><div class="auth-form-wrap"><span class="eyebrow">A SEAT AT THE TABLE</span><h2>Create your account</h2><p class="auth-lead">Tell us a little about yourself so we can make this space yours.</p>
      @if (errorMessage()) { <div class="form-error" role="alert">{{errorMessage()}}</div> }
      <form [formGroup]="form" (ngSubmit)="submit()"><label>Username<input formControlName="username" placeholder="Choose a username" autocomplete="username"></label><label>Your name<input formControlName="name" placeholder="First and last name" autocomplete="name"></label><label>Email address<input type="email" formControlName="email" placeholder="you@example.com" autocomplete="email"></label><label>Profile picture<input type="file" accept="image/*" (change)="onPicture($event)" aria-label="Choose a profile picture"></label>@if (pictureError()) { <small class="input-error">{{pictureError()}}</small> } @if (form.controls.picture.value) { <img class="signup-preview" [src]="form.controls.picture.value" alt="Preview of your profile picture"> }<label>Create a password<input type="password" formControlName="password" placeholder="At least 8 characters" autocomplete="new-password"></label><label>Credit card · class demo<input formControlName="mockCard" readonly aria-describedby="card-note"></label><small id="card-note" class="card-note">Mock number only (all zeros). Do not enter real payment details.</small><label>What do you love reading?<select formControlName="preference"><option>Fiction & stories</option><option>Writing & creativity</option><option>Poetry</option><option>Non-fiction</option></select></label><button class="button button-dark auth-submit" type="submit" [disabled]="form.invalid || !form.controls.picture.value">Create my account <span>↗</span></button></form><p class="auth-switch">Already have an account? <a routerLink="/login">Sign in</a></p><div class="demo-note"><span>✳</span><p><strong>Coursework prototype</strong><br>Profile and demo credentials stay on this device. Do not reuse a real password or enter real card details.</p></div><a routerLink="/" class="back-link">← Back to BookNest</a></div></section></div>
  `
})
export class SignupPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly store = inject(BooknestService);
  readonly errorMessage = signal('');
  readonly pictureError = signal('');
  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_.-]+$/)]],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    picture: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    mockCard: ['0000000000000000', Validators.required],
    preference: ['Fiction & stories'],
  });
  constructor() { this.store.pageTitle('Join BookNest'); }
  onPicture(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 1024 * 1024) {
      this.pictureError.set('Choose an image smaller than 1 MB.'); this.form.controls.picture.setValue(''); return;
    }
    const reader = new FileReader();
    reader.onload = () => { this.form.controls.picture.setValue(String(reader.result ?? '')); this.pictureError.set(''); };
    reader.onerror = () => this.pictureError.set('The image could not be read. Please choose another.');
    reader.readAsDataURL(file);
  }
  submit() {
    if (this.form.invalid || !this.form.controls.picture.value) return;
    const value = this.form.getRawValue();
    const result = this.store.registerStudent({ username: value.username, name: value.name, email: value.email, picture: value.picture, preference: value.preference, password: value.password, cardLastFour: '0000', mockCardNumber: value.mockCard, role: 'student' });
    if (!result.ok) { this.errorMessage.set(result.message ?? 'Could not create the account.'); return; }
    this.router.navigateByUrl('/fees');
  }
}
