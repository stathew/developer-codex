---
title: Angular Reactive Forms
summary: FormGroup, FormControl and FormArray, validators and typed forms, cross-field validation — and Signal Forms, stable as of Angular 22.
difficulty: intermediate
tags: [angular, forms, typescript]
order: 10
related: [frontend/angular, frontend/angular-signals, frontend/rxjs-in-angular]
status: needs-review
reviewNotes: New entry in the Angular-depth batch. Signal Forms' stable status (Angular 22, June 2026, after being experimental in v20/v21) verified fresh on 2026-11-21.
---

Angular has had two ways to build forms for years — **template-driven** (`[(ngModel)]`, simple but limited) and **reactive** (the model lives in the component, more testable and scalable) — and, as of Angular 22, a third: **Signal Forms**.

## Building a reactive form

```ts
export class CheckoutForm {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    address: this.fb.group({
      line1: ['', Validators.required],
      postcode: ['', Validators.required],
    }),
    items: this.fb.array([] as FormGroup[]),
  });

  addItem() {
    this.form.controls.items.push(this.fb.group({ sku: [''], quantity: [1, Validators.min(1)] }));
  }
}
```

```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <input formControlName="email" />
  @if (form.controls.email.invalid && form.controls.email.touched) {
    <span class="error">Enter a valid email</span>
  }
  <div formGroupName="address">
    <input formControlName="line1" placeholder="Address line 1" />
  </div>
  <button type="submit" [disabled]="form.invalid">Place order</button>
</form>
```

- **`FormGroup`** — a named collection of controls (and nested groups).
- **`FormControl`** — one input's value and validity.
- **`FormArray`** — a dynamic, numbered list of controls (line items, tags, phone numbers).

Since Angular 14, forms are **strictly typed** by default: `this.form.controls.email.value` is `string`, not `any` — catching a typo in a control name at compile time instead of at runtime.

## Validators

```ts
// Built-in
Validators.required, Validators.email, Validators.min(1), Validators.pattern(/^\d{5}$/)

// Custom synchronous validator
function futureDate(control: AbstractControl): ValidationErrors | null {
  return new Date(control.value) > new Date() ? null : { pastDate: true };
}

// Async validator — e.g. checking an email isn't already registered
function uniqueEmail(api: AccountApi): AsyncValidatorFn {
  return (control) => api.checkEmail(control.value).pipe(
    map(exists => (exists ? { taken: true } : null)),
  );
}

// Cross-field validation lives on the parent group, not either individual control
function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const g = group as FormGroup;
  return g.controls['password'].value === g.controls['confirm'].value ? null : { mismatch: true };
}
```

## Form state

Every control tracks: `value`, `valid`/`invalid`, `dirty` (changed from its initial value) vs `pristine`, `touched` (blurred at least once) vs `untouched`. Showing validation errors only after `touched` (rather than immediately on load) is the usual UX choice — shown in the template example above.

```ts
form.valueChanges.subscribe(value => localStorage.setItem('draft', JSON.stringify(value)));  // autosave draft
form.statusChanges.subscribe(status => this.formStatus.set(status));  // 'VALID' | 'INVALID' | 'PENDING' | 'DISABLED'
```

## Signal Forms (stable since Angular 22)

**Signal Forms** model form state as signals instead of an `AbstractControl` tree, so form values and validity integrate directly with the rest of a signals-based component — no `async` pipe or manual subscription needed to react to changes:

```ts
readonly email = signal('');
readonly emailField = field(this.email, { validators: [required(), email()] });
```

> [!NOTE]
> Signal Forms reaching stable in Angular 22 doesn't retire Reactive Forms — both are fully supported, and most existing codebases have no pressing reason to migrate. For a **new** Angular 22+ project, Signal Forms is worth strong consideration; for an established reactive-forms codebase, there's no urgency.

```recall
Q: What's the difference between FormGroup, FormControl and FormArray?
A: FormControl tracks one input's value and validity; FormGroup is a named collection of controls (including nested groups); FormArray is a dynamic, numbered list of controls.

Q: Where does a cross-field validator (e.g. "passwords must match") belong?
A: On the parent FormGroup, since it needs to read the values of more than one sibling control.

Q: What changed about reactive forms' typing in Angular 14?
A: Forms became strictly typed by default, so a control's value has its actual type (not `any`), catching control-name typos at compile time.

Q: What is the key architectural difference Signal Forms brings compared to classic Reactive Forms?
A: Form state is modelled as signals rather than an AbstractControl tree, so it integrates directly with other signals in the component without async pipes or manual subscriptions.
```
