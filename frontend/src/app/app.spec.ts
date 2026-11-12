import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('BookNest app shell', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('creates the main navigation and footer', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const content = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(content).toContain('YOUR SPACE');
    expect(content).toContain('BookNest Academy');
  });
});
