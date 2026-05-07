# ADR-002: Three-tier token architecture

**Status:** Accepted  
**Date:** 2026-05-05

---

## Context

Design tokens are name-value pairs for design decisions (colors, spacing, etc.). The question was how many layers of indirection to use.

---

## Decision

We use **three tiers**: Primitive → Semantic → Component.

---

## The three tiers explained

### Tier 1: Primitive tokens (`src/primitive/`)
Raw values with no meaning attached. Like constants in code.

```json
{ "color": { "blue": { "500": { "$value": "#1A5BB6" } } } }
```

**Rule:** Never reference a primitive token directly in a component. They exist only to be referenced by semantic tokens.

**Why this rule?** If `stamp-button` directly used `{color.blue.500}`, then changing the brand blue requires hunting every component that used that primitive. With semantics, you change one line.

---

### Tier 2: Semantic tokens (`src/semantic/`)
Intent-named tokens that reference primitives. These are the tokens components actually use.

```json
{ "color": { "brand": { "primary": { "$value": "{color.blue.500}" } } } }
```

**Why intent matters:** `color.brand.primary` encodes *purpose*. `color.blue.500` encodes *appearance*. Dark mode is just swapping one semantic file — all components update automatically because their tokens are intent-based, not value-based.

**Dark mode mechanics:**
- Light: `color.text.primary → neutral.900 (#111827)`
- Dark: `color.text.primary → neutral.50 (#F5F7FA)`
- Components reference `color.text.primary` — they don't know or care about the raw value.

---

### Tier 3: Component tokens (`src/component/`)
Per-component tokens that reference semantic tokens.

```json
{ "button": { "bg": { "default": { "$value": "{color.brand.primary}" } } } }
```

**Why this tier?** It enables per-component theming without touching the semantic layer. An enterprise customer can override `--stamp-button-bg-default` for their brand color while leaving `--stamp-color-brand-primary` unchanged (which affects dozens of other components). This is the "theme within a theme" capability.

---

## Consequences

**Positive:**
- Dark mode is one source file swap, not touching any component code.
- Component theming is possible at any granularity.
- Breaking changes are explicit: renaming a semantic token is a search-and-replace across component tokens only, not scattered through CSS.

**Negative:**
- Three levels of indirection makes tracing "what's the final color of this button" require following references across three files.
- More upfront work to define all three tiers before shipping the first component.

---

## Style Dictionary — how tokens become CSS

Style Dictionary reads all three tier files, resolves `{color.blue.500}` references to their actual values, and writes `dist/css/tokens.css` with the final computed values:

```css
:root {
  --stamp-color-blue-500: #1A5BB6;
  --stamp-color-brand-primary: #1A5BB6;   /* resolved from {color.blue.500} */
  --stamp-button-bg-default: #1A5BB6;     /* resolved from {color.brand.primary} */
}
```

Components reference `var(--stamp-button-bg-default)`. The CSS var chain resolves at render time in the browser — but Style Dictionary has already baked the final values at build time, so there's no runtime resolution cost.
