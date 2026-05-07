# ADR-001: Web Components (Lit) over React-only components

**Status:** Accepted  
**Date:** 2026-05-05  
**Deciders:** Stamp DS team

---

## Context

We needed to choose a component runtime for the design system. The main candidates were:

| Option | Description |
|--------|-------------|
| A — React-only | Ship `@stamp-ds/react`, everyone uses React hooks and JSX |
| B — Web Components (Lit) | Ship framework-agnostic WC, wrap per-framework as needed |
| C — Headless (just tokens + CSS) | No component code at all — consumers build their own |

The products that will consume this design system include:
- A React SPA (daily/)
- A planned Angular enterprise portal
- Vanilla HTML email templates (marketing)
- Potential Vue.js marketing site

---

## Decision

**We chose Option B — Web Components via Lit** as the primary runtime, with thin wrapper packages for React (`@stamp-ds/react`) and Angular (`@stamp-ds/angular`).

---

## Reasoning

### 1. Write once, run everywhere
A React component cannot be used in Angular without a full rewrite. A Web Component defined once in Lit works natively in React, Angular, Vue, Svelte, and vanilla HTML — because it compiles to a browser-native custom element. The wrappers only handle framework-specific ergonomics (event mapping, property binding), not the component logic.

### 2. Framework version independence
If a consumer upgrades from React 18 to React 19 (or Angular 16 to 18), the Web Component doesn't need to change. It's compiled to browser APIs that don't have breaking versions. React-only components must be rebuilt and re-tested on every major React release.

### 3. Shadow DOM isolation
Each component has its own CSS scope. A global `.button { color: red }` in the host page cannot accidentally override Stamp component styles. This is critical for a design system — consumers shouldn't need to fight specificity wars.

### 4. The Lit trade-off is manageable
Lit adds ~6KB gzipped. For a design system, this is acceptable because the runtime is shared across all components on the page — it's not per-component cost. The React wrappers via `@lit-labs/react` add ~2KB.

---

## Consequences

**Positive:**
- One codebase serves all frameworks.
- Components are upgrade-proof against framework versions.
- CSS isolation prevents accidental style leakage.

**Negative:**
- `@lit-labs/react` is needed to properly pass objects/arrays to WC from React (React passes all props as strings otherwise).
- Angular requires `CUSTOM_ELEMENTS_SCHEMA` in every consuming module.
- Server-side rendering (SSR) for WC requires `@lit-labs/ssr`, adding complexity if needed later.

---

## Alternatives rejected

**React-only:** Excludes Angular consumers. Creates lock-in to one framework's release cycle.

**Headless/tokens-only:** Too much per-team implementation cost. Accessibility patterns would be inconsistently implemented across teams.
