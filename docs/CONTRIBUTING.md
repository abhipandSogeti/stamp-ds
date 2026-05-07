# Contributing a new component

Follow this checklist every time you add a component to `@stamp-ds/components`.

---

## Step 1 — Define component tokens

Before writing any TypeScript, define the component's token tier in `packages/tokens/src/component/your-component.json`.

```json
{
  "your-component": {
    "bg": { "$value": "{color.brand.primary}", "$type": "color" },
    "radius": { "$value": "{radius.md}", "$type": "dimension" }
  }
}
```

**Rule:** Only reference semantic tokens (Tier 2), never primitives (Tier 1).  
**Why:** Primitive references break dark mode and theming (see ADR-002).

After adding, rebuild tokens: `pnpm --filter @stamp-ds/tokens build`

---

## Step 2 — Create the component directory

```
packages/components/src/your-component/
  stamp-your-component.ts       ← LitElement class
  stamp-your-component.css.ts   ← CSS tagged template (optional, for large CSS)
  index.ts                      ← named exports
  stamp-your-component.stories.ts ← Storybook stories
```

---

## Step 3 — Extend StampElement

```ts
import { StampElement } from '../base/StampElement.js';

@customElement('stamp-your-component')
export class StampYourComponent extends StampElement {
  // Your props here
}
```

`StampElement` gives you: `size`, `disabled`, token CSS injection, and `:host([disabled])` opacity handling.

---

## Step 4 — ARIA requirements checklist

Every component must pass these before merging:

- [ ] Uses the correct native element where possible (button → `<button>`, input → `<input>`)
- [ ] Has an `aria-label` or `aria-labelledby` strategy documented in JSDoc
- [ ] `disabled` reflected to attribute for `[disabled]` CSS selectors
- [ ] Focus ring visible on keyboard navigation (`:focus-visible`)
- [ ] Keyboard interaction matches the [ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/)
- [ ] `role` set correctly (only override native semantics when needed)
- [ ] Dynamic content uses appropriate live region (`role="status"` for polite, `role="alert"` for assertive)

---

## Step 5 — CSS rules

```css
/* DO: reference component tokens via CSS vars */
:host { background: var(--stamp-your-component-bg); }

/* DON'T: hardcode values */
:host { background: #1A5BB6; }

/* DON'T: reference primitive tokens directly from components */
:host { background: var(--stamp-color-blue-500); }
```

---

## Step 6 — Write stories (minimum required set)

| Story name | What it tests |
|------------|---------------|
| `Playground` | All props exposed as Controls; interactive |
| `All Variants` | Every variant/state side-by-side; `controls: {disable: true}` |
| `A11y Check` | Edge cases for accessibility: icon-only, disabled, loading |

Optional but encouraged:
- Dark mode story (switch the global colorScheme to dark in `parameters.globals`)
- `InContext` story (showing the component in a realistic layout)

---

## Step 7 — Export from barrel

Add to `packages/components/src/index.ts`:
```ts
export * from './your-component/index.js';
```

---

## Step 8 — Add Angular directive

Add `packages/angular/src/directives/your-component.directive.ts` with `@Input()` for every prop and `@Output()` for every custom event. Add to `StampModule` imports/exports array.

---

## Step 9 — Add React wrapper

Add to `packages/react/src/index.ts`:
```ts
export const YourComponent = createComponent({
  tagName: 'stamp-your-component',
  elementClass: StampYourComponent,
  react: React,
  events: { onStampChange: 'stamp-change' },
});
```

---

## Step 10 — Write a changeset

```bash
pnpm changeset
```

Select `@stamp-ds/components` as the changed package. Choose the bump level:
- `patch` — bug fix, invisible change
- `minor` — new component or new prop (backwards compatible)
- `major` — breaking change (removed prop, renamed tag)

Write a one-line summary for the changelog entry.
