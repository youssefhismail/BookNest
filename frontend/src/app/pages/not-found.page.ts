import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({ standalone: true, imports: [RouterLink], template: `<section class="not-found"><span class="not-found-mark">404</span><span class="eyebrow">THIS PAGE WANDERED OFF</span><h1>Let's find our <em>way back.</em></h1><p>The page you’re looking for isn’t on this shelf.</p><a class="button button-dark" routerLink="/">Back to BookNest <span>↗</span></a></section>` })
export class NotFoundPage {}
