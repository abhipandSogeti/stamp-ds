# Stamp Design System

Framework-agnostic Web Components design system built with Lit, powered by a 3-tier token pipeline.

**Packages:**
| Package | npm | Description |
|---------|-----|-------------|
| `@stamp-ds/tokens` | — | CSS vars, JS/TS, SCSS token outputs |
| `@stamp-ds/components` | — | Lit Web Components (framework-agnostic) |
| `@stamp-ds/react` | — | React wrappers via @lit-labs/react |
| `@stamp-ds/angular` | — | Angular directives + StampModule |
| `@stamp-ds/icons` | — | SVG sprite + stamp-icon Web Component |

---

## Quick start

### Vanilla HTML
```html
<!-- 1. Load tokens (CSS custom properties) -->
<link rel="stylesheet" href="node_modules/@stamp-ds/tokens/dist/css/tokens.css"/>

<!-- 2. Load components (registers custom elements) -->
<script type="module" src="node_modules/@stamp-ds/components/dist/index.js"></script>

<!-- 3. Use them -->
<stamp-button variant="solid">Save</stamp-button>
<stamp-input label="Email" placeholder="you@example.com"></stamp-input>
```

### React
```tsx
import '@stamp-ds/tokens/css';                    // load CSS vars
import '@stamp-ds/components';                    // register WC
import { Button, Input, Checkbox } from '@stamp-ds/react';

export function Form() {
  return (
    <form>
      <Input label="Name" placeholder="Jane Doe" onStampInput={e => console.log(e.detail.value)} />
      <Checkbox label="Accept terms" onStampChange={e => console.log(e.detail.checked)} />
      <Button variant="solid" onStampClick={() => console.log('clicked')}>Submit</Button>
    </form>
  );
}
```

### Angular
```ts
// app.module.ts
import { NgModule }    from '@angular/core';
import { StampModule } from '@stamp-ds/angular';
import '@stamp-ds/components';  // register custom elements

@NgModule({
  imports: [StampModule],
})
export class AppModule {}
```

```html
<!-- in a template -->
<stamp-button variant="solid" (stampClick)="onSave()">Save</stamp-button>
<stamp-input label="Email" (stampInput)="onEmailChange($event)"></stamp-input>
```

---

## Dark mode

```html
<!-- Load both token files — swap them based on user preference -->
<link id="stamp-theme" rel="stylesheet" href="@stamp-ds/tokens/dist/css/tokens.css"/>

<script>
  // Toggle dark mode:
  document.getElementById('stamp-theme').href =
    '@stamp-ds/tokens/dist/css/tokens.dark.css';
</script>
```

---

## Development

```bash
# Install all workspace deps
pnpm install

# Build everything (tokens → components → react → angular)
pnpm build

# Start Storybook dev server (localhost:6006)
cd apps/storybook && pnpm dev

# Build tokens only
pnpm --filter @stamp-ds/tokens build

# Type-check all packages
pnpm type-check
```

---

## Releasing

Stamp uses [Changesets](https://github.com/changesets/changesets) for versioning.

```bash
# 1. After your changes, create a changeset:
pnpm changeset
# → select changed packages, choose bump level (patch/minor/major), write description

# 2. Commit the .changeset/ file with your PR.
# 3. CI will open a "Version Packages" PR automatically on merge to main.
# 4. Merging that PR triggers npm publish.
```

---

## Docs

- [ADR-001: Why Web Components over React](docs/ADR-001-web-components-over-react.md)
- [ADR-002: Why 3-tier tokens](docs/ADR-002-token-tiers.md)
- [Contributing a new component](docs/CONTRIBUTING.md)
- [Accessibility checklist](docs/ACCESSIBILITY.md)
