# Accessibility — WCAG 2.2 AA Compliance Checklist

Stamp targets WCAG 2.2 Level AA. This document lists per-component requirements and how each is implemented.

---

## Global requirements (all components)

| Criterion | WCAG | Implementation |
|-----------|------|----------------|
| Focus visible | 2.4.7 | `:focus-visible` ring on all interactive elements (3px brand + 5px focus border) |
| Color not sole indicator | 1.4.1 | Error states use icon + text + border color (never just color) |
| Text resize to 200% | 1.4.4 | All sizing uses `rem` units; no pixel-locked layouts |
| Minimum contrast 4.5:1 | 1.4.3 | All text/bg token pairs verified in Figma; axe-core checks in Storybook |
| Non-text contrast 3:1 | 1.4.11 | Form control borders, focus rings, icon colors all meet 3:1 against background |
| Motion can be disabled | 2.3.3 | `@media (prefers-reduced-motion)` disables transitions on all components |
| Keyboard accessible | 2.1.1 | All interactive components operable without a mouse |
| No keyboard trap | 2.1.2 | Focus can leave every component with Tab/Shift-Tab |

---

## stamp-button

| Criterion | WCAG | Notes |
|-----------|------|-------|
| Native button | 4.1.2 | `<button>` element used — keyboard and form behaviour built in |
| Disabled state | 4.1.2 | `aria-disabled` + native `disabled` both set |
| Loading state | 4.1.3 | `aria-busy="true"` on button; visible spinner has `aria-hidden="true"` |
| Icon-only button | 1.1.1 | `aria-label` required via `label` prop |
| Focus ring | 2.4.7 | `:focus-visible` 3px + 5px dual ring |

---

## stamp-input

| Criterion | WCAG | Notes |
|-----------|------|-------|
| Label association | 1.3.1 | Native `<label for>` links to input `id` |
| Error identification | 3.3.1 | `aria-invalid="true"` + `role="alert"` on error message |
| Error description | 3.3.3 | Error text is `aria-describedby` on the input |
| Required field | 3.3.2 | `aria-required="true"` + visible asterisk |
| Placeholder not label | 1.3.1 | `placeholder` is supplementary — label always shown |
| Helper text | 3.3.2 | `aria-describedby` links helper text to input |

---

## stamp-checkbox

| Criterion | WCAG | Notes |
|-----------|------|-------|
| Native checkbox | 4.1.2 | `<input type="checkbox">` — Space toggles, screen reader announces |
| Indeterminate | 4.1.2 | `aria-checked="mixed"` per ARIA spec |
| Label association | 1.3.1 | Native `<label for>` links to checkbox `id` |
| Group navigation | 2.1.1 | Multiple checkboxes tab naturally; use `<fieldset>` at group level |

---

## stamp-badge

| Criterion | WCAG | Notes |
|-----------|------|-------|
| Static badge | 1.3.1 | No ARIA role needed — it's supplementary metadata |
| Live badge (count) | 4.1.3 | `role="status"` (polite live region) on `live` prop |
| Color not sole indicator | 1.4.1 | Each variant uses both color AND semantic text |

---

## stamp-spinner

| Criterion | WCAG | Notes |
|-----------|------|-------|
| Announced on appear | 4.1.3 | `role="status"` — polite live region announces label when spinner mounts |
| Accessible name | 1.1.1 | `aria-label` defaults to "Loading"; customisable via `label` prop |
| Animation | 2.3.3 | `@media (prefers-reduced-motion: reduce)` pauses animation |

---

## Testing process

1. **Automated** — axe-core via `@storybook/addon-a11y` runs on every story in CI.
2. **Manual keyboard** — Tab through every interactive state, verify focus is visible and logical.
3. **Screen reader** — Test with VoiceOver (macOS) and NVDA (Windows) on the A11y Check story.
4. **Contrast** — Token pairs checked in Figma's contrast plugin + axe `color-contrast` rule.

---

## Reporting an accessibility issue

File a GitHub issue with label `a11y` and include:
- Component name
- WCAG criterion violated
- Steps to reproduce with a screen reader or keyboard
- Browser + assistive technology version
