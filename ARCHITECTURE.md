# Stamp DS — Full Architecture Guide

> **Purpose:** This is the authoritative reference for how stamp-ds is built, why every decision was made, and how every piece connects. Read this before writing any code, adding any package, or changing the build pipeline.

---

## Table of Contents

1. [Philosophy & Goals](#1-philosophy--goals)
2. [Repository Layout](#2-repository-layout)
3. [Package Manager & Workspace Setup](#3-package-manager--workspace-setup)
4. [Dependency Graph](#4-dependency-graph)
5. [Design Token Pipeline](#5-design-token-pipeline)
6. [Component Library (`@stamp-ds/components`)](#6-component-library-stamp-dscomponents)
7. [React Adapter (`@stamp-ds/react`)](#7-react-adapter-stamp-dsreact)
8. [Angular Adapter (`@stamp-ds/angular`)](#8-angular-adapter-stamp-dsangular)
9. [Icon System (`@stamp-ds/icons`)](#9-icon-system-stamp-dsicons)
10. [Storybook App](#10-storybook-app)
11. [Theming System](#11-theming-system)
12. [Accessibility Architecture](#12-accessibility-architecture)
13. [Build System (Turborepo)](#13-build-system-turborepo)
14. [TypeScript Configuration](#14-typescript-configuration)
15. [CI/CD Pipeline](#15-cicd-pipeline)
16. [Publishing & Release Flow](#16-publishing--release-flow)
17. [Developer Workflow — Adding a Component](#17-developer-workflow--adding-a-component)
18. [Architectural Decision Records (ADRs)](#18-architectural-decision-records-adrs)

---

## 1. Philosophy & Goals

### What stamp-ds Is

Stamp DS is a **framework-agnostic design system**. It ships production-ready UI components that work in any front-end environment — vanilla HTML, React, Angular, or any other framework — without shipping multiple component implementations.

### Why Web Components as the Foundation

Most design systems pick a framework (usually React) and then maintain separate ports for Vue, Angular, etc. Those ports always lag behind, introduce inconsistency, and create long-term maintenance burden.

Stamp DS chooses **Lit Web Components** (custom elements) as the single implementation layer:

- **One source of truth:** `stamp-button` is defined once. React, Angular, and vanilla HTML all use the exact same element and the exact same behavior.
- **Framework upgrade-proof:** When a team upgrades from React 18 to React 19 (or migrates away from React entirely), the component library does not need to change.
- **CSS isolation via Shadow DOM:** Styles inside a component never leak out and external styles never bleed in. No CSS specificity wars, no class name collisions.
- **Native browser semantics:** Lit compiles down to standard `customElements.define()` calls. No virtual DOM, no framework runtime, no bundle weight.

The thin React and Angular adapter packages (`@stamp-ds/react`, `@stamp-ds/angular`) add only the ergonomic sugar each framework needs — event prop mapping, ref forwarding, `@Input`/`@Output` binding — without re-implementing any component logic.

### Design Token Philosophy

Components must never hard-code visual values. Every color, spacing unit, radius, shadow, or motion value lives in the token system and flows through three tiers:

```
Primitive tokens → Semantic tokens → Component tokens → CSS custom properties → Component styles
```

This separation means:
- Dark mode requires changing only which CSS file is loaded — no component code changes.
- Rebranding requires changing only primitive tokens.
- Per-component theming is possible by overriding component-level CSS variables.

---

## 2. Repository Layout

```
stamp-ds/                          ← monorepo root
├── .github/
│   └── workflows/
│       ├── ci.yml                 ← runs on every push/PR
│       └── release.yml            ← runs on push to main
│
├── docs/
│   ├── CONTRIBUTING.md            ← component creation checklist
│   ├── ARCHITECTURE.md            ← this file
│   ├── ACCESSIBILITY.md           ← WCAG criteria per component
│   ├── ADR-001-web-components-over-react.md
│   └── ADR-002-token-tiers.md
│
├── packages/
│   ├── tokens/                    ← @stamp-ds/tokens
│   ├── components/                ← @stamp-ds/components
│   ├── react/                     ← @stamp-ds/react
│   ├── angular/                   ← @stamp-ds/angular
│   └── icons/                     ← @stamp-ds/icons
│
├── apps/
│   └── storybook/                 ← @stamp-ds/storybook (private)
│
├── package.json                   ← workspace root (no source code here)
├── pnpm-workspace.yaml            ← declares packages/* and apps/*
├── pnpm-lock.yaml                 ← deterministic lock file
├── turbo.json                     ← build task pipeline
├── tsconfig.base.json             ← shared TypeScript baseline
└── .npmrc                        ← pnpm hoisting exceptions for Storybook
```

**The root `package.json` contains no application code.** It only holds workspace-level scripts, dev tool dependencies (Turborepo, Changesets, TypeScript, ESLint, Prettier), and the pnpm workspace configuration.

---

## 3. Package Manager & Workspace Setup

### pnpm 9

The repo uses **pnpm** as the package manager for its workspace support, strict isolation model, and disk efficiency.

**`pnpm-workspace.yaml`:**
```yaml
packages:
  - "packages/*"
  - "apps/*"
```

This tells pnpm that every directory under `packages/` and `apps/` is a workspace package. They can reference each other as `workspace:*` in `package.json` `dependencies`, which means pnpm symlinks them locally at install time rather than fetching from npm.

**Why `workspace:*` instead of `workspace:^version`?**
Using `*` means "always use whatever version exists in this repo." During development, this is what you want — you always get the latest local build. When Changesets publishes, it replaces `workspace:*` with real semver ranges automatically.

**`.npmrc` — Storybook Hoisting Exception:**
```
node-linker=isolated
public-hoist-pattern[]=*storybook*
public-hoist-pattern[]=*chromatic*
```

pnpm's isolated mode keeps each package's `node_modules` strictly scoped. But Storybook's plugin system uses dynamic `require()` calls that expect to find packages in a flat, hoisted structure. The `public-hoist-pattern` lines tell pnpm to hoist all `storybook` and `chromatic` packages to the root `node_modules`, satisfying Storybook's discovery mechanism.

---

## 4. Dependency Graph

This graph shows which packages depend on which. Build order flows top-to-bottom.

```
@stamp-ds/tokens          ← no internal dependencies
       │
       ├─────────────────────────────────┐
       ▼                                 ▼
@stamp-ds/components              @stamp-ds/icons
       │
       ├───────────────────────────┐
       ▼                           ▼
@stamp-ds/react            @stamp-ds/angular
```

And the Storybook app:

```
@stamp-ds/tokens ──┐
                   ├── @stamp-ds/storybook (private app)
@stamp-ds/components ─┘
```

**Why does Storybook depend on both tokens and components directly?**

Storybook needs to load the CSS token files (`tokens.css`, `tokens.dark.css`) explicitly — it injects them into the `<head>` via Vite's `?url` import mechanism and swaps them to implement the light/dark toggle. Components themselves do not bundle tokens; they read from CSS custom properties at runtime, so the CSS must already be present in the document.

---

## 5. Design Token Pipeline

### Overview

The token system is built on **Style Dictionary v4**. Raw JSON files define every visual value. A build script transforms those JSON files into every output format consumers need.

### Token Tier System

Tokens are organized in three tiers. Each tier builds on the previous.

#### Tier 1 — Primitive Tokens (`packages/tokens/src/primitive/`)

These are raw, context-free values. They have no semantic meaning — they just enumerate what exists.

| File | What it defines |
|------|----------------|
| `color.json` | 10 color families (blue, orange, neutral, green, red, yellow), each with 10 shades (50–900) |
| `typography.json` | Font families (Inter, JetBrains Mono), sizes (10–40px), weights (400–700), line heights, letter spacing |
| `spacing.json` | rem-based scale from 0 to 6rem |
| `radius.json` | 8 radius values from 2px to full (9999px) |
| `motion.json` | Duration values (0–500ms) and easing curves (linear, ease-in, ease-out, spring) |
| `opacity.json` | 4 named levels: disabled (0.38), muted (0.6), overlay (0.72), full (1.0) |
| `shadow.json` | 6 shadow levels (0 = none, 5 = dramatic) |
| `z-index.json` | Named layers: base (0), dropdown (100), modal (300), toast (500) |

**Rule:** Primitive tokens are never referenced directly in components. They exist only to be referenced by semantic tokens.

**Example:**
```json
{
  "color": {
    "blue": {
      "500": { "value": "#1A5BB6" }
    }
  }
}
```

#### Tier 2 — Semantic Tokens (`packages/tokens/src/semantic/`)

Semantic tokens assign **intent** to primitive values. Instead of "blue-500", you say "brand primary". This is the layer that changes between themes.

| File | What it defines |
|------|----------------|
| `color.light.json` | Intent-based mappings for light mode (brand, text, surface, border, feedback) |
| `color.dark.json` | The same set of keys, mapped to different primitive values for dark mode |
| `typography.json` | Named type scales (text.display, text.heading, text.body, text.label, text.code) — composites of primitive font values |
| `spacing.json` | Named gaps and layout spacings (space.component.gap-xs, space.layout.section, etc.) |

**Light mode example:**
```json
{
  "color": {
    "text": {
      "primary": { "value": "{color.neutral.900}" }
    },
    "brand": {
      "primary": { "value": "{color.blue.500}" }
    }
  }
}
```

**Dark mode example (same keys, different references):**
```json
{
  "color": {
    "text": {
      "primary": { "value": "{color.neutral.50}" }
    },
    "brand": {
      "primary": { "value": "{color.blue.300}" }
    }
  }
}
```

When Style Dictionary builds, `{color.neutral.900}` is resolved to the actual hex value from the primitive file. The output CSS has no references — only resolved values.

#### Tier 3 — Component Tokens (`packages/tokens/src/component/`)

Component tokens assign semantic values to specific component slots. A component's CSS references only component tokens, never semantic or primitive ones.

**Why a third tier?**

Without this layer, if you wanted `stamp-button`'s background to be `color.brand.primary`, you'd write `var(--stamp-color-brand-primary)` directly in the component CSS. That works, but it prevents per-component theming — you can't override the button's background without also affecting everything else that uses brand primary. Component tokens break this coupling.

```json
{
  "button": {
    "bg": {
      "default": { "value": "{color.brand.primary}" },
      "hover": { "value": "{color.brand.hover}" },
      "active": { "value": "{color.brand.active}" }
    },
    "text": {
      "default": { "value": "{color.text.on-brand}" }
    }
  }
}
```

A consumer who wants to rebrand just the button can override `--stamp-button-bg-default` without touching the global brand color.

### Build Script (`packages/tokens/scripts/build-tokens.mjs`)

The build script runs Style Dictionary twice — once for light mode (all platforms), once for dark mode (CSS only).

**Pass 1 — Light Mode:**
```
Source: src/primitive/*.json + src/semantic/color.light.json + src/semantic/*.json + src/component/*.json
Platforms:
  - CSS → dist/css/tokens.css (all tokens as --stamp-* CSS custom properties on :root)
  - JS  → dist/js/tokens.js (ESM export of nested object)
  - JSON → dist/json/tokens.json (nested object)
  - SCSS → dist/scss/_tokens.scss ($stamp-* SCSS variables)
```

**Pass 2 — Dark Mode:**
```
Source: src/primitive/*.json + src/semantic/color.dark.json + src/semantic/typography.json + src/semantic/spacing.json + src/component/*.json
Platforms:
  - CSS only → dist/css/tokens.dark.css (same keys, dark-resolved values, also on :root)
```

**CSS Custom Property Naming:**

Style Dictionary flattens the JSON hierarchy using a separator. The prefix `stamp` is added to namespace all variables.

```
color.brand.primary → --stamp-color-brand-primary
button.bg.default → --stamp-button-bg-default
typography.text.body.font-size → --stamp-typography-text-body-font-size
```

**Output: `dist/css/tokens.css`:**
```css
:root {
  --stamp-color-blue-500: #1A5BB6;
  --stamp-color-neutral-900: #111827;
  /* ... all primitives ... */
  --stamp-color-brand-primary: #1A5BB6;
  --stamp-color-text-primary: #111827;
  /* ... all semantics ... */
  --stamp-button-bg-default: #1A5BB6;
  --stamp-button-text-default: #FFFFFF;
  /* ... all component tokens ... */
}
```

All references are fully resolved. The CSS file is self-contained — no further substitution needed at runtime.

---

## 6. Component Library (`@stamp-ds/components`)

### Technology Choice: Lit v3

**Lit** is a lightweight library (5KB gzip) built on Web Components standards. It provides:

- **`LitElement`** — a base class that manages reactive properties, rendering lifecycle, and Shadow DOM
- **`html` and `css` template literals** — tagged template literals processed at definition time, not at render time, for performance
- **Decorators** — `@property()`, `@state()`, `@customElement()`, `@query()` for clean class-based component authoring

Lit does **not** introduce a virtual DOM. It uses efficient DOM diffing on its own lit-html template engine, which only updates the parts of the DOM that actually changed.

### Build: Pure TypeScript Compilation

Components are built with `tsc` (TypeScript compiler) only — no bundler (no Rollup, no esbuild, no Webpack).

**Why no bundler?**

Components are a library, not an application. A bundler would inline all dependencies (Lit, tokens) into a single file, preventing tree-shaking, causing duplicate Lit instances when multiple packages are used, and inflating the final application bundle. Using `tsc` outputs one `.js` file per source file, preserving the module graph. Application bundlers (Vite, Webpack, Rollup) handle the final bundling when consumers build their apps.

**`packages/components/tsconfig.json`:**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["src/**/*.stories.ts"]
}
```

`.stories.ts` files are excluded so Storybook story code never ships in the npm package.

### Base Class: `StampElement`

**`src/base/StampElement.ts`** is the root of the inheritance chain for all components.

```
LitElement (Lit)
    └── StampElement (stamp-ds base)
            └── StampButton, StampInput, StampCheckbox, StampBadge, StampSpinner
```

`StampElement` provides three things:

1. **`size` property** — Reflected to an HTML attribute. Available as `this.size` in every component and targetable via `:host([size="sm"])` CSS selectors.

2. **`disabled` property** — Reflected to the `disabled` HTML attribute. Available as `this.disabled`. CSS uses `:host([disabled])` to apply opacity and cursor styling without per-component code.

3. **Global styles** — Applied to every component's Shadow DOM:
   ```css
   :host {
     box-sizing: border-box;
     font-family: var(--stamp-typography-font-family-sans);
   }
   :host([disabled]) {
     opacity: var(--stamp-opacity-disabled);
     cursor: not-allowed;
     pointer-events: none;
   }
   ```

### Components

#### `stamp-button`

**File:** `src/button/stamp-button.ts`

**Renders:** A native `<button>` element inside Shadow DOM. Using a native button gives keyboard focus, `type` attribute, form submission, and screen reader semantics for free.

**Properties:**
| Property | Type | Default | Reflected | Purpose |
|----------|------|---------|-----------|---------|
| `variant` | `solid\|outline\|ghost\|danger` | `solid` | yes | Visual style |
| `size` | `sm\|md\|lg` | `md` | yes (inherited) | Dimensions |
| `type` | `button\|submit\|reset` | `button` | no | HTML button type |
| `disabled` | `boolean` | `false` | yes (inherited) | Disabled state |
| `loading` | `boolean` | `false` | yes | Shows spinner, blocks clicks |
| `label` | `string` | `''` | no | Accessible label for icon-only usage |

**Events:**
- `stamp-click` — Fires when the button is clicked and not disabled/loading. Detail: `{ originalEvent: MouseEvent }`. Composed and bubbling so it crosses Shadow DOM boundaries.

**Loading state:** When `loading=true`, the component renders `<stamp-spinner>` inside the button, sets `aria-busy="true"`, and suppresses click events. The button remains focusable (for UX continuity) but is non-interactive.

**Focus ring:** Uses a dual-ring pattern — 3px inner ring + 5px outer ring — achieved via `box-shadow`. This ensures visibility on both light and dark backgrounds.

**CSS tokens used:**
```
--stamp-button-bg-default / hover / active / disabled
--stamp-button-text-default
--stamp-button-border-default
--stamp-button-radius
--stamp-button-padding-x-sm/md/lg
--stamp-button-font-size-sm/md/lg
--stamp-button-font-weight
```

#### `stamp-input`

**File:** `src/input/stamp-input.ts`

**Renders:** A `<label>` wrapping a `<div>` (the field wrapper) containing a native `<input>`. The label and input are connected via `for`/`id` attributes rather than nesting, giving better control over flex layout.

**Properties:**
| Property | Type | Purpose |
|----------|------|---------|
| `label` | `string` | Visible label text |
| `placeholder` | `string` | Input placeholder |
| `type` | `string` | HTML input type (text, email, password, etc.) |
| `value` | `string` | Controlled value |
| `name` | `string` | Form field name |
| `helper` | `string` | Help text below the field |
| `error` | `string` | Error message (replaces helper, changes visual state) |
| `required` | `boolean` | Sets aria-required + visual indicator |
| `readonly` | `boolean` | Read-only field |
| `disabled` | `boolean` | Disabled state (inherited from StampElement) |
| `size` | `sm\|md\|lg` | Field height and font size |

**Events:**
- `stamp-input` — Fires on every input event. Detail: `{ value: string }`.

**Accessibility:**
- `aria-required` when `required=true`
- `aria-invalid="true"` when `error` is set
- `aria-describedby` pointing to the helper/error element ID
- Error message rendered in a `<span role="alert">` so screen readers announce it immediately when it appears

**Slots:** The component exposes `prefix` and `suffix` slots for icons or addons (e.g., a currency symbol before the input, a clear button after).

#### `stamp-checkbox`

**File:** `src/checkbox/stamp-checkbox.ts`

**Renders:** A visually custom checkbox built on top of a native `<input type="checkbox">`. The native input is visually hidden but remains in the accessibility tree — screen readers and keyboard users interact with the real checkbox.

**Why not style the native input directly?**

CSS cannot fully style `<input type="checkbox">` appearance across all browsers consistently. The approach here hides the native input with `opacity: 0; position: absolute; width: 0;` and renders a custom `<div>` overlay that is visually synced with the native state.

**Properties:**
| Property | Type | Purpose |
|----------|------|---------|
| `checked` | `boolean` | Checked state |
| `indeterminate` | `boolean` | Indeterminate state (tri-state) |
| `label` | `string` | Visible label |
| `name` | `string` | Form name |
| `value` | `string` | Form value |
| `disabled` | `boolean` | Disabled |
| `size` | `sm\|md\|lg` | Visual size |

**Indeterminate state:** HTML `<input type="checkbox">` supports `indeterminate` as a JS property but not as an HTML attribute. Lit's `updated()` lifecycle hook sets `this._nativeInput.indeterminate = this.indeterminate` after every render to keep them in sync.

**Events:**
- `stamp-change` — Detail: `{ checked: boolean, value: string }`.

#### `stamp-badge`

**File:** `src/badge/stamp-badge.ts`

**Renders:** An inline `<span>` with a `<slot>` for text content.

**Properties:**
| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `variant` | `neutral\|brand\|danger\|success\|warning` | `neutral` | Color scheme |
| `size` | `sm\|md\|lg` | `md` | Size |
| `live` | `boolean` | `false` | Dynamic count badge |

**Live regions:** When `live=true`, the component adds `role="status"` and `aria-live="polite"`. This tells screen readers to announce changes to the badge's text without interrupting the user. Use this for notification counts that update dynamically (e.g., an unread message count).

**CSS tokens used:**
```
--stamp-badge-neutral-bg / text
--stamp-badge-brand-bg / text
--stamp-badge-danger-bg / text
--stamp-badge-success-bg / text
--stamp-badge-warning-bg / text
```

#### `stamp-spinner`

**File:** `src/spinner/stamp-spinner.ts`

**Renders:** An SVG ring with a CSS rotation animation.

**Properties:**
| Property | Type | Default | Purpose |
|----------|------|---------|---------|
| `label` | `string` | `"Loading"` | Screen reader text |
| `size` | `sm\|md\|lg` | `md` | Ring diameter |
| `disabled` | `boolean` | `false` | Suppresses animation |

Always has `role="status"` and `aria-label` set to `label`. The visual SVG is `aria-hidden="true"`.

**Reduced motion:** The animation is wrapped in a `@media (prefers-reduced-motion: no-preference)` block. On systems with reduced motion enabled, the spinner shows a static ring instead of rotating. This respects OS-level accessibility settings.

### Custom Event Architecture

All components dispatch events that:
- Are `CustomEvent` instances (not plain `Event`)
- Have `bubbles: true` — propagate up the DOM tree
- Have `composed: true` — cross Shadow DOM boundaries (essential for framework event listeners)
- Carry a `detail` object with relevant data

**Why `composed: true`?**

Without `composed: true`, events stop at the Shadow DOM boundary. React's synthetic event system and Angular's `(eventName)` bindings both work at the document level or at the host element level — they never see events that die inside the shadow root.

### Barrel Export (`src/index.ts`)

```ts
export { StampButton } from './button/index.js';
export { StampInput } from './input/index.js';
export { StampCheckbox } from './checkbox/index.js';
export { StampBadge } from './badge/index.js';
export { StampSpinner } from './spinner/index.js';
```

The `.js` extension is required for ESM in Node.js, even though the source files are `.ts`. TypeScript with `moduleResolution: bundler` resolves these correctly.

---

## 7. React Adapter (`@stamp-ds/react`)

### The Problem

React treats Web Components as black boxes. It passes all props as HTML attributes (strings only), which breaks for complex props like objects/arrays. React's event system also does not listen for custom DOM events — `onClick` maps to the `click` event, but `onStampClick` has no corresponding DOM event mapping.

### The Solution: `@lit-labs/react`

The `createComponent()` function from `@lit-labs/react` generates a proper React component that:

1. **Accepts React props** and sets them as Lit reactive properties (not attributes), so objects and arrays work
2. **Maps React event handler props** to native DOM `addEventListener` calls
3. **Forwards refs** to the underlying DOM element

**`packages/react/src/index.ts`:**
```ts
import React from 'react';
import { createComponent } from '@lit-labs/react';
import { StampButton } from '@stamp-ds/components/button';

export const Button = createComponent({
  tagName: 'stamp-button',
  elementClass: StampButton,
  react: React,
  events: {
    onStampClick: 'stamp-click',
  },
});
```

**What `createComponent` generates:**

```tsx
// The generated component behaves like this (simplified):
const Button = React.forwardRef((props, ref) => {
  const { onStampClick, variant, size, disabled, loading, children, ...rest } = props;
  const elementRef = useRef(null);

  useEffect(() => {
    const el = elementRef.current;
    el.addEventListener('stamp-click', onStampClick);
    return () => el.removeEventListener('stamp-click', onStampClick);
  }, [onStampClick]);

  // Sets Lit reactive properties, not HTML attributes
  useEffect(() => { el.variant = variant; }, [variant]);

  return <stamp-button ref={mergeRefs(ref, elementRef)} {...rest}>{children}</stamp-button>;
});
```

### Usage in a React App

```tsx
import { Button } from '@stamp-ds/react';

function App() {
  return (
    <Button
      variant="solid"
      size="md"
      onStampClick={(e) => console.log(e.detail)}
    >
      Click me
    </Button>
  );
}
```

The consumer imports from `@stamp-ds/react`, not `@stamp-ds/components`. They never touch `customElements.define()`.

---

## 8. Angular Adapter (`@stamp-ds/angular`)

### The Problem

Angular's change detection and template binding work through `@Input()` and `@Output()` decorators. Without them, Angular cannot set properties on a Web Component from templates — it would fall back to attribute strings.

Angular also requires `CUSTOM_ELEMENTS_SCHEMA` to accept unknown HTML element names.

### The Solution: Angular Directives

Each component has a corresponding Angular `@Directive` with the component's selector:

**`packages/angular/src/directives/button.directive.ts`:**
```ts
import { Directive, ElementRef, Input, Output, EventEmitter, OnDestroy } from '@angular/core';

@Directive({ selector: 'stamp-button', standalone: true })
export class ButtonDirective implements OnDestroy {
  @Input() variant: 'solid' | 'outline' | 'ghost' | 'danger' = 'solid';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() stampClick = new EventEmitter<CustomEvent>();

  private _handler = (e: Event) => this.stampClick.emit(e as CustomEvent);

  constructor(private el: ElementRef<HTMLElement>) {
    el.nativeElement.addEventListener('stamp-click', this._handler);
  }

  ngOnDestroy() {
    this.el.nativeElement.removeEventListener('stamp-click', this._handler);
  }
}
```

**How it works:**

1. Angular sees `<stamp-button [variant]="'outline'" (stampClick)="handler($event)">` in a template
2. The `ButtonDirective` matches `selector: 'stamp-button'`
3. Angular's binding engine calls the `@Input()` setter for `variant` — this sets the Lit reactive property on the DOM element
4. The constructor attaches a native `addEventListener` for `stamp-click`; when it fires, it emits through the `@Output()` `EventEmitter`
5. `CUSTOM_ELEMENTS_SCHEMA` in `StampModule` prevents Angular from throwing "unknown element" errors

### `StampModule`

```ts
@NgModule({
  declarations: [],
  imports: [ButtonDirective, InputDirective, CheckboxDirective, BadgeDirective, SpinnerDirective],
  exports: [ButtonDirective, InputDirective, CheckboxDirective, BadgeDirective, SpinnerDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class StampModule {}
```

### Usage in an Angular App

```html
<!-- app.component.html -->
<stamp-button
  variant="solid"
  [loading]="isSubmitting"
  (stampClick)="onSubmit($event)">
  Submit
</stamp-button>
```

```ts
// app.module.ts
import { StampModule } from '@stamp-ds/angular';

@NgModule({
  imports: [StampModule],
})
export class AppModule {}
```

---

## 9. Icon System (`@stamp-ds/icons`)

### Architecture

The icon system uses an **SVG sprite sheet** pattern. All icons are compiled into a single `sprite.svg` file containing `<symbol>` elements. The `<stamp-icon>` Web Component renders a `<use>` element referencing the correct symbol.

**Why a sprite sheet?**

Without a sprite, each icon instance would either:
1. Inline the full SVG markup into the HTML — bloats the DOM for pages with many icons
2. Fetch an individual SVG file per icon — causes many HTTP requests

A sprite sheet is loaded once and all instances reference into it with zero additional network cost.

### Build Process (`scripts/build-icons.mjs`)

1. **Read** all `.svg` files from `src/svg/`
2. **Optimize** each SVG through SVGO v3:
   - Removes metadata, comments, unused IDs
   - Collapses unnecessary groups
   - Converts basic shapes (rect, circle) to path elements
   - Normalizes viewBox
3. **Extract** the `viewBox` attribute and inner SVG content from each optimized file
4. **Generate `dist/sprite.svg`:**
   ```xml
   <svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
     <symbol id="stamp-icon-check" viewBox="0 0 24 24">
       <path d="M20 6L9 17l-5-5"/>
     </symbol>
     <symbol id="stamp-icon-x" viewBox="0 0 24 24">
       <path d="M18 6L6 18M6 6l12 12"/>
     </symbol>
     <!-- ... -->
   </svg>
   ```
5. **Generate `dist/icons.json`** — metadata array: `[{ name: 'check', viewBox: '0 0 24 24' }, ...]`
6. **Generate `dist/index.js`** — The `<stamp-icon>` Web Component:
   ```ts
   @customElement('stamp-icon')
   export class StampIcon extends LitElement {
     @property() name: IconName = '';
     @property({ type: Number }) size = 0;
     @property() label = '';

     render() {
       return html`
         <svg
           aria-label=${this.label || nothing}
           aria-hidden=${this.label ? nothing : 'true'}
           width=${this.size || nothing}
           height=${this.size || nothing}
         >
           <use href="#stamp-icon-${this.name}"></use>
         </svg>
       `;
     }
   }
   ```
7. **Generate `dist/index.d.ts`** — TypeScript type: `export type IconName = 'check' | 'x' | 'chevron-down' | ...`

### Using Icons

Consumers must include the sprite in their document:

```html
<!-- Include sprite once in your HTML -->
<div id="sprite-container" style="display:none">
  <!-- inline the contents of @stamp-ds/icons/dist/sprite.svg, or -->
  <!-- OR use a framework to dynamically inject it -->
</div>

<!-- Then use anywhere -->
<stamp-icon name="check" size="24" label="Confirmed"></stamp-icon>
<stamp-icon name="x" size="16"></stamp-icon>  <!-- decorative, no label -->
```

**Accessibility:** If `label` is provided, the SVG gets `aria-label` and is announced by screen readers. If no label, the SVG is `aria-hidden="true"` — it's treated as purely decorative.

---

## 10. Storybook App

### Purpose

Storybook serves three roles:

1. **Interactive documentation** — Engineers and designers can explore all components, toggle all props, and see every state
2. **Development environment** — Component authors work directly in Storybook, seeing live changes
3. **Visual regression testing** — Chromatic captures pixel-perfect snapshots of every story and compares them across commits

### Framework: `@storybook/web-components-vite`

This framework tells Storybook to render stories as Lit `html` templates (not React JSX) and use Vite as the dev server / bundler.

**Why Vite for Storybook?**

Vite uses native ES modules in development, which means the dev server starts in under a second regardless of how many components exist. Changes to a single component only re-transform that one file.

### Configuration Files

#### `.storybook/main.ts` — Core Configuration

This is the master config that Storybook's build process reads.

```ts
const config: StorybookConfig = {
  framework: '@storybook/web-components-vite',

  // Where to find story files
  stories: [
    '../apps/storybook/docs/**/*.mdx',
    '../packages/*/src/**/*.stories.@(ts|js)',
  ],

  addons: [
    '@storybook/addon-docs',       // auto-generates Docs pages
    '@storybook/addon-a11y',       // axe-core accessibility panel
    '@storybook/addon-themes',     // light/dark theme toggle
    '@storybook/addon-viewport',   // device breakpoint presets
    '@storybook/addon-backgrounds', // background switcher
    '@chromatic-com/storybook',    // visual regression
  ],

  docs: {
    autodocs: 'tag',  // only generate Docs page for stories with tags: ['autodocs']
  },
};
```

**The `stories` glob pattern** reaches into `packages/*/src/**` — this means component authors write their stories next to their component source code. Storybook discovers them automatically. No manual registration needed.

#### `.storybook/preview.ts` — Browser-Side Configuration

This runs in the browser context (unlike `main.ts` which runs in Node). It configures how stories are rendered.

**Token injection mechanism:**

```ts
import tokensCssUrl from '@stamp-ds/tokens/css?url';       // Vite: gives URL string, not CSS content
import tokensDarkCssUrl from '@stamp-ds/tokens/dark?url';

const tokenLink = document.createElement('link');
tokenLink.rel = 'stylesheet';
tokenLink.href = tokensCssUrl;
document.head.appendChild(tokenLink);
```

The `?url` suffix is a Vite feature — it imports the asset's URL rather than inlining its content. This lets Storybook dynamically swap the `href` when the user toggles between light and dark mode.

**Theme toggle decorator:**

```ts
const withTheme: Decorator = (Story, context) => {
  const { colorScheme } = context.globals;
  const link = document.getElementById('stamp-token-link');
  link.href = colorScheme === 'dark' ? tokensDarkCssUrl : tokensCssUrl;
  document.documentElement.setAttribute('data-scheme', colorScheme);
  return Story();
};

export const decorators = [withTheme];
```

Every story is wrapped in this decorator. When the user clicks the theme toggle in the toolbar, `colorScheme` changes, the decorator runs again, and the CSS swaps. No story code needs to do anything — theming is infrastructure.

**`globalTypes`** define the toolbar controls:

```ts
export const globalTypes = {
  colorScheme: {
    name: 'Color Scheme',
    defaultValue: 'light',
    toolbar: {
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
    },
  },
};
```

**Global parameters set in `preview.ts`:**

- `backgrounds` — 4 presets: Surface (#F5F7FA), White, Dark surface (#111827), Brand blue
- `viewport` — Custom breakpoints: mobile (375px), tablet (768px), desktop (1280px), wide (1440px)
- `layout: 'centered'` — Every story renders centered in the canvas
- `controls` — Expanded by default, sorted with required props first
- `a11y` — Color contrast enabled; landmark/heading rules disabled (false positives in isolated iframe)
- `docs.toc: true` — Table of contents in Docs pages
- `storySort` — Custom sidebar order: Stamp DS section first, then Components

#### `.storybook/manager.ts` — Storybook UI Chrome

Configures the sidebar and UI shell — not the story canvas.

```ts
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Stamp DS',
    brandUrl: '/',
    colorPrimary: '#1A5BB6',
    colorSecondary: '#FF8800',
    fontBase: '"Inter", sans-serif',
    fontCode: '"JetBrains Mono", monospace',
  }),
  sidebar: { showRoots: true },
});
```

### Story File Anatomy

Every component has a `.stories.ts` file co-located with the component source. Here is the pattern every story must follow:

```ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { StampButton } from './stamp-button.js';
import './stamp-button.js';  // ← CRITICAL: registers the custom element

const meta: Meta<StampButton> = {
  title: 'Components/Button',   // ← determines sidebar location
  component: 'stamp-button',    // ← tells addon-docs which element to introspect
  tags: ['autodocs'],           // ← triggers auto-generated Docs page
  argTypes: { /* prop controls */ },
  args: { /* default arg values */ },
};
export default meta;

type Story = StoryObj<StampButton>;

// REQUIRED stories:
export const Playground: Story = { /* all props controllable */ };
export const AllVariants: Story = { /* every variant side-by-side */ };
export const A11yCheck: Story = { /* edge cases for accessibility */ };

// OPTIONAL:
export const Sizes: Story = { /* size comparison */ };
export const States: Story = { /* loading, disabled, error, etc. */ };
```

**Why import the component JS file?**

Web Components must be registered via `customElements.define()` before they can be rendered. Importing the `.js` file triggers the `@customElement('stamp-button')` decorator which calls `customElements.define`. Without this line, `<stamp-button>` renders as an unknown HTML element with no behavior.

### MDX Documentation Pages

Located in `apps/storybook/docs/`, these are written in MDX (Markdown + JSX/HTML). Storybook renders them as full documentation pages in the sidebar.

Pages:
- **Introduction** — What stamp-ds is, design principles, quick links
- **Getting Started** — Installation, CSS loading, per-framework setup (HTML, React, Angular)
- **Design Tokens** — Token tiers, how to override, output formats
- **Theming** — Light/dark switching, custom themes, per-component overrides
- **Contributing** — Component creation workflow (mirrors `docs/CONTRIBUTING.md`)
- **React** — React-specific setup, TypeScript types, event handling patterns
- **Angular** — Angular-specific setup, `StampModule` import, template syntax

---

## 11. Theming System

### How CSS Custom Properties Cross Shadow Boundaries

Shadow DOM provides style isolation — external CSS does not bleed in. However, **CSS custom properties (CSS variables) are inherited across shadow boundaries**. This is the foundational mechanism that makes theming work.

When a document has:
```css
:root {
  --stamp-color-brand-primary: #1A5BB6;
}
```

And a Web Component inside Shadow DOM has:
```css
:host {
  background: var(--stamp-color-brand-primary);
}
```

The `var()` lookup traverses up through the shadow boundary to find the value on `:root`. This is defined behavior in the CSS Custom Properties spec.

### Light / Dark Theme Switch

The project ships two CSS files:

- `dist/css/tokens.css` — all `--stamp-*` properties set to light mode values
- `dist/css/tokens.dark.css` — all the same `--stamp-*` properties set to dark mode values

Both files use `:root` as the selector. Swapping which file is loaded swaps all values simultaneously.

**Framework integration:**

```html
<!-- Light mode -->
<link id="stamp-theme" rel="stylesheet" href="node_modules/@stamp-ds/tokens/dist/css/tokens.css">

<!-- Toggle to dark mode -->
<script>
  document.getElementById('stamp-theme').href =
    'node_modules/@stamp-ds/tokens/dist/css/tokens.dark.css';
</script>
```

**Alternative: `data-scheme` attribute:**

If you prefer a single CSS file, you can import both and scope them to an attribute:

```css
/* tokens.css */
:root { --stamp-color-text-primary: #111827; }
[data-scheme="dark"] { --stamp-color-text-primary: #F5F7FA; }
```

Then toggle `document.documentElement.setAttribute('data-scheme', 'dark')`. This approach ships slightly more CSS but avoids the link swap.

### Per-Component Theming

Any component's visual appearance can be overridden by re-declaring its component tokens:

```css
/* Override just the button's background without touching global brand colors */
.my-custom-scope stamp-button {
  --stamp-button-bg-default: #FF6B35;
  --stamp-button-bg-hover: #E55A2B;
  --stamp-button-text-default: #FFFFFF;
}
```

CSS custom properties cascade, so this override applies only within `.my-custom-scope`.

---

## 12. Accessibility Architecture

Accessibility is built into the component architecture, not added afterward.

### Strategy per Component Type

| Component Type | Approach |
|----------------|----------|
| Action elements (button) | Render native `<button>` — inherits all native a11y for free |
| Form inputs | Render native `<input>` with visible `<label>` linked via `for`/`id` |
| Custom-appearance inputs (checkbox) | Native `<input type="checkbox">` visually hidden, custom appearance layered on top |
| Status indicators (badge) | `role="status"` + `aria-live="polite"` when dynamic |
| Loading indicators (spinner) | `role="status"` + `aria-label` always present |
| Decorative icons | `aria-hidden="true"` |
| Labeled icons | `aria-label` on SVG |

### ARIA Attribute Patterns

**`disabled` propagation:**
All components reflect the `disabled` property to an HTML attribute via `@property({ reflect: true })`. This allows:
- `aria-disabled="true"` on the host element (for AT users)
- `:host([disabled])` CSS selectors (for visual states)
- Native disabled behavior on the underlying `<input>` or `<button>`

**`aria-busy`:**
Set to `"true"` on `stamp-button` when `loading=true`. Screen readers interpret this as "this element is loading — do not interact."

**`aria-invalid` + `aria-describedby`:**
When `stamp-input` has an `error` value:
- The native `<input>` gets `aria-invalid="true"`
- `aria-describedby` is set to the ID of the error `<span role="alert">`
- Screen readers announce the error immediately when it appears

### Focus Ring Design

All interactive components use `:focus-visible` (not `:focus`) to show focus rings only during keyboard navigation, not mouse clicks.

The ring style uses a dual-box-shadow pattern:
```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px white, 0 0 0 5px var(--stamp-color-border-focus);
}
```

The inner white ring provides contrast on any background color. The outer colored ring provides the visible indicator.

### Reduced Motion

Components with animations include:
```css
@media (prefers-reduced-motion: reduce) {
  /* disable or simplify animation */
}
```

The spinner shows a static ring. Transition durations collapse to near-zero.

### Testing Accessibility

Every story has an `A11yCheck` variant that covers edge cases:
- Icon-only usage (no visible text, only `label` prop)
- Disabled state
- Error state (for inputs)
- Loading state (for buttons)

The `@storybook/addon-a11y` addon runs `axe-core` on every story render and shows violations in the Accessibility panel.

---

## 13. Build System (Turborepo)

### Why Turborepo

Turborepo is a build orchestrator designed for monorepos. It understands the dependency graph between packages and:

1. **Runs tasks in the correct order** — Never builds `@stamp-ds/components` before `@stamp-ds/tokens`
2. **Caches task outputs** — If `packages/tokens/src/` hasn't changed, `turbo run build` skips it and uses the cached `dist/`
3. **Runs independent tasks in parallel** — `react` and `angular` can build simultaneously since they don't depend on each other
4. **Enables incremental CI** — Only re-runs what changed since the last push

### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

**`"dependsOn": ["^build"]`:** The `^` prefix means "the `build` of all packages I depend on must complete first." For `@stamp-ds/components`, this means `@stamp-ds/tokens#build` must succeed before `@stamp-ds/components#build` starts. Turborepo reads the `workspace:*` dependencies in each `package.json` to construct this graph automatically.

**`"outputs": ["dist/**"]`:** Tells Turborepo which files constitute the task's output for caching purposes. If none of the inputs changed, Turborepo restores `dist/**` from cache and considers the task done.

**`"persistent": true` (dev):** Long-running tasks like `storybook dev` should not be killed after they "complete." Turborepo keeps them alive.

**`"cache": false` (dev):** Development tasks should never use cached output — you always want the current state.

### Build Order

The actual execution order Turborepo produces:

```
Step 1 (parallel):
  @stamp-ds/tokens#build    (node scripts/build-tokens.mjs)
  @stamp-ds/icons#build     (node scripts/build-icons.mjs)

Step 2 (parallel, after tokens):
  @stamp-ds/components#build   (tsc --project tsconfig.json)

Step 3 (parallel, after components):
  @stamp-ds/react#build         (tsc --project tsconfig.json)
  @stamp-ds/angular#build       (tsc --project tsconfig.json)

Step 4 (after tokens + components):
  @stamp-ds/storybook#build    (storybook build)
```

### Running the Build

```sh
# Full build of everything (respects dependency order)
pnpm run build

# Build only one package (and its dependencies)
pnpm --filter @stamp-ds/components build

# Run Storybook dev server
pnpm run dev

# Type-check all packages
pnpm run type-check
```

---

## 14. TypeScript Configuration

### `tsconfig.base.json` (Root)

All package-level `tsconfig.json` files extend this.

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true
  }
}
```

**Key decisions:**

- **`target: ES2020`** — Components use class fields and optional chaining. ES2020 is supported natively in all modern browsers. No transpilation to ES5.
- **`module: ESNext`** — Outputs native ESM. Required for tree-shaking.
- **`moduleResolution: bundler`** — Lets TypeScript resolve imports the same way modern bundlers (Vite, esbuild) do. Allows importing `.js` files that are actually `.ts` in source.
- **`experimentalDecorators: true`** — Required for Lit's `@customElement()`, `@property()`, etc.
- **`useDefineForClassFields: false`** — Lit's property system relies on TypeScript class fields being emitted as prototype assignments. The `false` setting preserves this behavior. With `true`, TypeScript would use `Object.defineProperty()` which breaks Lit's property observation.
- **`declaration: true` + `declarationMap: true`** — Ships `.d.ts` type files and source maps for them. TypeScript consumers get proper types and can navigate to source.

### Per-Package `tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["src/**/*.stories.ts"]
}
```

The `exclude` for `.stories.ts` is important: it prevents Storybook stories from being compiled into the npm package output.

---

## 15. CI/CD Pipeline

### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push to any branch and every pull request open/update.

```yaml
on:
  push:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0          # full history needed for Chromatic

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          cache-dependency-path: pnpm-lock.yaml

      - run: pnpm install --frozen-lockfile

      - run: pnpm turbo run lint type-check test build

      # Visual regression — only on PRs
      - if: github.event_name == 'pull_request'
        uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          onlyChanged: true         # only capture stories that changed
          exitZeroOnChanges: true   # don't fail CI on visual diffs, just flag them
```

**`fetch-depth: 0`:** Chromatic needs the full git history to find the ancestor commit for baseline comparison. Shallow clones (`fetch-depth: 1`) would prevent Chromatic from finding a baseline.

**`--frozen-lockfile`:** Fails if `pnpm-lock.yaml` is out of sync with `package.json` files. Prevents "it works on my machine" issues caused by implicit dependency resolution.

**`onlyChanged: true` (Chromatic):** Chromatic only snapshots stories whose component files changed in this PR. This dramatically reduces Chromatic usage on large PRs with many unrelated changes.

**`exitZeroOnChanges: true` (Chromatic):** Visual changes don't fail CI — they create a review task in the Chromatic dashboard. A developer must review and accept or reject the changes there. This prevents visual regressions from blocking PRs while still surfacing them.

### Required Secrets

| Secret | Used By | Purpose |
|--------|---------|---------|
| `CHROMATIC_PROJECT_TOKEN` | CI workflow | Authenticates Chromatic upload |
| `NPM_TOKEN` | Release workflow | Authenticates npm publish |

---

## 16. Publishing & Release Flow

### Tool: Changesets

Changesets is a workflow tool for versioning monorepo packages. It solves the problem: "Which packages changed? What version bump do they need? What should the changelog say?"

### Step-by-Step Flow

#### 1. Writing a Changeset

When a developer finishes a change that affects a public package, they run:

```sh
pnpm changeset
```

This starts an interactive CLI:
1. "Which packages changed?" → Select from the list (e.g., `@stamp-ds/components`)
2. "What type of change?" → `patch` (bug fix), `minor` (new feature, backwards compatible), `major` (breaking change)
3. "Describe the change:" → Write a user-facing summary

This creates a `.changeset/random-name.md` file, e.g.:

```markdown
---
"@stamp-ds/components": minor
---

Added `loading` prop to `stamp-button` with spinner and `aria-busy` support.
```

The developer commits this file along with their code changes.

#### 2. "Version Packages" PR (Automated)

When the `main` branch has one or more unmerged `.changeset/*.md` files, the Release workflow's `changesets/action` step detects them and opens an automated PR titled **"Version Packages"**.

This PR:
- Bumps `version` in each affected package's `package.json`
- Appends entries to `CHANGELOG.md` in each package
- Deletes the processed `.changeset/*.md` files

#### 3. Publishing (Automated on Merge)

When "Version Packages" is merged to `main`, the Release workflow runs again. This time there are no `.changeset/*.md` files. The `changesets/action` publishes instead:

```sh
pnpm changeset publish
```

This:
1. Finds all packages where `package.json` version > the version currently published to npm
2. Runs `pnpm run build` for each
3. Publishes each package to npm with the scoped name `@stamp-ds/`
4. Creates a GitHub Release for each package with the changelog entry

#### 4. Consumer Version Pinning

Published packages use real semver ranges. `workspace:*` in internal `package.json` files is automatically replaced by Changesets with the resolved version range (e.g., `^0.2.0`) before publishing.

### Release Workflow (`.github/workflows/release.yml`)

```yaml
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4 + actions/setup-node@v4

      - run: pnpm install --frozen-lockfile

      - run: pnpm turbo run build

      - uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          version: pnpm changeset version
          commit: "chore: version packages"
          title: "Version Packages"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 17. Developer Workflow — Adding a Component

This section walks through adding a new component end-to-end.

### Example: Adding `stamp-tooltip`

#### Step 1: Define Component Tokens

Create `packages/tokens/src/component/tooltip.json`:

```json
{
  "tooltip": {
    "bg": { "value": "{color.surface.inverse}" },
    "text": { "value": "{color.text.inverse}" },
    "radius": { "value": "{radius.sm}" },
    "padding": { "value": "{space.component.gap-xs} {space.component.gap-sm}" },
    "font-size": { "value": "{typography.text.label.font-size}" },
    "shadow": { "value": "{shadow.3}" }
  }
}
```

**Rules:**
- Only reference semantic tokens (`{color.surface.inverse}`), never primitives (`{color.neutral.900}`)
- Define a token for every CSS value that should be overridable

Rebuild tokens:
```sh
pnpm --filter @stamp-ds/tokens build
```

Verify `dist/css/tokens.css` now includes `--stamp-tooltip-*` variables.

#### Step 2: Create the Component Directory

```sh
mkdir packages/components/src/tooltip
touch packages/components/src/tooltip/stamp-tooltip.ts
touch packages/components/src/tooltip/stamp-tooltip.stories.ts
touch packages/components/src/tooltip/index.ts
```

#### Step 3: Implement the Component

`stamp-tooltip.ts`:
```ts
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StampElement } from '../base/StampElement.js';

@customElement('stamp-tooltip')
export class StampTooltip extends StampElement {
  @property() text = '';
  @property({ type: Boolean, reflect: true }) open = false;

  static styles = [
    ...StampElement.styles,
    css`
      :host { display: inline-block; position: relative; }
      .tooltip {
        background: var(--stamp-tooltip-bg);
        color: var(--stamp-tooltip-text);
        border-radius: var(--stamp-tooltip-radius);
        padding: var(--stamp-tooltip-padding);
        font-size: var(--stamp-tooltip-font-size);
        box-shadow: var(--stamp-tooltip-shadow);
        position: absolute;
        bottom: calc(100% + 8px);
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        display: none;
      }
      :host([open]) .tooltip { display: block; }
    `,
  ];

  render() {
    return html`
      <slot
        @mouseenter=${() => { this.open = true; }}
        @mouseleave=${() => { this.open = false; }}
        @focusin=${() => { this.open = true; }}
        @focusout=${() => { this.open = false; }}
      ></slot>
      <div
        class="tooltip"
        role="tooltip"
        id="tooltip-${this.id}"
      >
        ${this.text}
      </div>
    `;
  }
}
```

`index.ts`:
```ts
export { StampTooltip } from './stamp-tooltip.js';
```

#### Step 4: Add Storybook Stories

`stamp-tooltip.stories.ts`:
```ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { StampTooltip } from './stamp-tooltip.js';
import './stamp-tooltip.js';
import '../button/stamp-button.js';

const meta: Meta<StampTooltip> = {
  title: 'Components/Tooltip',
  component: 'stamp-tooltip',
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text', description: 'Tooltip content' },
  },
  args: { text: 'Helpful hint' },
};
export default meta;
type Story = StoryObj<StampTooltip>;

export const Playground: Story = {
  name: '▶ Playground',
  render: (args) => html`
    <stamp-tooltip text=${args.text}>
      <stamp-button>Hover me</stamp-button>
    </stamp-tooltip>
  `,
};

export const AllVariants: Story = {
  name: '📋 All Variants',
  parameters: { controls: { disable: true } },
  render: () => html`
    <stamp-tooltip text="Short tip">
      <stamp-button variant="solid">Hover</stamp-button>
    </stamp-tooltip>
  `,
};

export const A11yCheck: Story = {
  name: '♿ A11y Check',
  parameters: {
    controls: { disable: true },
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
  render: () => html`
    <stamp-tooltip text="Confirm submission" open>
      <stamp-button>Submit</stamp-button>
    </stamp-tooltip>
  `,
};
```

#### Step 5: Export from Components Barrel

`packages/components/src/index.ts`:
```ts
export { StampButton } from './button/index.js';
export { StampInput } from './input/index.js';
export { StampCheckbox } from './checkbox/index.js';
export { StampBadge } from './badge/index.js';
export { StampSpinner } from './spinner/index.js';
export { StampTooltip } from './tooltip/index.js';  // ← add this
```

Also add to `package.json` exports:
```json
"./tooltip": "dist/tooltip/index.js"
```

#### Step 6: Add Sub-Path Export to Package

`packages/components/package.json`:
```json
{
  "exports": {
    ".": "dist/index.js",
    "./button": "dist/button/index.js",
    "./tooltip": "dist/tooltip/index.js"
  }
}
```

#### Step 7: Add Angular Directive

`packages/angular/src/directives/tooltip.directive.ts`:
```ts
@Directive({ selector: 'stamp-tooltip', standalone: true })
export class TooltipDirective implements OnDestroy {
  @Input() text = '';
  @Input() open = false;
  constructor(private el: ElementRef) {}
}
```

Add to `StampModule` imports and exports.

#### Step 8: Add React Wrapper

`packages/react/src/index.ts`:
```ts
import { StampTooltip } from '@stamp-ds/components/tooltip';

export const Tooltip = createComponent({
  tagName: 'stamp-tooltip',
  elementClass: StampTooltip,
  react: React,
  events: {},
});
```

#### Step 9: Write a Changeset

```sh
pnpm changeset
# Select @stamp-ds/tokens (minor), @stamp-ds/components (minor),
#        @stamp-ds/react (minor), @stamp-ds/angular (minor)
# Write: "Added stamp-tooltip component with keyboard and mouse trigger support."
```

#### Step 10: Build and Verify

```sh
pnpm run build       # full build
pnpm run dev         # open Storybook at http://localhost:6006
```

Verify:
- Token CSS variables are present in `packages/tokens/dist/css/tokens.css`
- Component appears in Storybook sidebar under "Components / Tooltip"
- All three stories render correctly
- A11y panel shows no violations
- Light/dark toggle works

---

## 18. Architectural Decision Records (ADRs)

Full text in `docs/ADR-*.md`. Summaries:

### ADR-001: Web Components Over React-First

**Decision:** Use Lit Web Components as the single implementation layer.

**Why not React-first?**

A React-first approach locks the design system to React's release cadence and requires maintaining (and keeping in sync) separate implementations for Vue, Angular, and Svelte consumers. History shows these ports always lag and diverge.

**Why Lit over raw Web Components?**

Raw `HTMLElement` + `customElements.define` requires writing manual property observation, DOM diffing, and template rendering. Lit provides exactly this infrastructure with a minimal (5KB) footprint and a clean decorator API.

**Trade-off:** React developers get a slightly different DX — they import from `@stamp-ds/react` instead of a native React component. The `createComponent()` adapter makes this largely transparent, but it is an extra layer compared to pure React components.

### ADR-002: Three-Tier Token Architecture

**Decision:** Separate tokens into primitive, semantic, and component tiers.

**Why not one flat file?**

A flat list cannot express relationships. Dark mode requires knowing "this color is the primary brand color" — not just its hex value. Without semantic aliases, you'd need to find and replace every hex value when switching themes.

**Why not two tiers (primitive + component)?**

Without a semantic tier, every component token would reference primitives directly: `{ "value": "{color.blue.500}" }`. Changing "brand blue" from 500 to 600 would require updating every component token that references blue-500. The semantic tier provides a single source of truth for intent.

**Trade-off:** Three tiers add some indirection — you cannot immediately see what `--stamp-button-bg-default` resolves to without following the chain. The Style Dictionary build resolves all references before output, so the shipped CSS has fully resolved values and no runtime performance cost.
