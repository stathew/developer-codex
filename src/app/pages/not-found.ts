import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>404 — not in the codex</h1>
    <p>This page doesn’t exist. Try the search (<kbd>/</kbd>) or head back home.</p>
    <a class="btn btn-primary" routerLink="/">Go home</a>
  `,
  styles: `:host { display: block; padding: 64px 40px; } h1 { color: var(--text-strong); } p { color: var(--text-muted); }`,
})
export class NotFound {}
