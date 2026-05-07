/**
 * STORYBOOK STORY FILE — stamp-button
 *
 * FORMAT: CSF3 (Component Story Format v3) — the current standard.
 * A story file has two parts:
 *   1. A DEFAULT export  (the "meta") — describes the component.
 *   2. Named exports     (the "stories") — each one is a single example.
 *
 * Storybook reads the default export to build the sidebar label, the Docs
 * page, and the ArgTypes table. It reads each named export as a story to
 * render in the preview.
 */

import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { StampButton } from './stamp-button.js';
import './stamp-button.js'; // registers <stamp-button> in the custom elements registry

// ─────────────────────────────────────────────────────────────────────────────
// META (default export)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The Meta object is the "component descriptor". It tells Storybook:
 *   - title:     Where in the sidebar hierarchy this appears.
 *                'Components/Button' → Components group → Button story.
 *   - component: The web component tag name OR class reference.
 *                Storybook uses this to generate ArgTypes from TypeScript.
 *   - tags:      ['autodocs'] opts this component into the auto Docs page.
 *   - argTypes:  Manually describe/override each prop's control widget.
 *   - args:      Default prop values used across all stories (can be
 *                overridden per story).
 *   - parameters: Story-level Storybook settings (layout, a11y, docs, etc.)
 */
const meta: Meta<StampButton> = {
  title: 'Components/Button',
  component: 'stamp-button' as unknown as typeof StampButton,
  tags: ['autodocs'],   // generates the Docs page

  /**
   * argTypes
   * Each key maps to a prop on the component. You can:
   *   - Add a 'control' to choose the UI widget in the Controls panel.
   *   - Add a 'description' to document what the prop does.
   *   - Add 'options' to list valid values for select/radio controls.
   *   - Set 'table.defaultValue' to show the default in the Docs table.
   *   - Set 'table.category' to group props into sections in the table.
   *
   * Control types: 'text', 'boolean', 'number', 'color', 'select',
   *                'radio', 'inline-radio', 'check', 'range', 'object',
   *                'file', 'date'
   */
  argTypes: {
    variant: {
      description: 'Visual style of the button.',
      control: { type: 'inline-radio' },   // renders as radio buttons, not a dropdown
      options: ['solid', 'outline', 'ghost', 'danger'],
      table: {
        defaultValue: { summary: 'solid' },
        category: 'Appearance',
      },
    },
    size: {
      description: 'Adjusts padding and font size.',
      control: { type: 'inline-radio' },
      options: ['sm', 'md', 'lg'],
      table: {
        defaultValue: { summary: 'md' },
        category: 'Appearance',
      },
    },
    disabled: {
      description: 'Prevents interaction and applies opacity. Reflected as HTML attribute.',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    loading: {
      description: 'Shows a spinner. Prevents click events.',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    type: {
      description: 'Native button type (passed to the inner <button> element).',
      control: { type: 'select' },
      options: ['button', 'submit', 'reset'],
      table: {
        defaultValue: { summary: 'button' },
        category: 'HTML',
      },
    },
    label: {
      description: 'Accessible label for icon-only buttons (sets aria-label).',
      control: { type: 'text' },
      table: {
        category: 'Accessibility',
      },
    },
  },

  /**
   * args (default args)
   * These are the prop values used if a story doesn't override them.
   * Every story in this file starts with variant='solid', size='md', etc.
   * Individual stories can spread these and override specific fields.
   */
  args: {
    variant: 'solid',
    size:    'md',
    disabled: false,
    loading:  false,
  },

  parameters: {
    /**
     * docs.description.component
     * This text appears at the top of the auto-generated Docs page,
     * above the props table. Use it to explain the component's purpose,
     * usage rules, and accessibility requirements.
     */
    docs: {
      description: {
        component: `
**stamp-button** is the primary interactive action element in the Stamp Design System.

### When to use each variant
- **solid** — primary CTA. One per view.
- **outline** — secondary action alongside a solid button.
- **ghost** — low-emphasis action (e.g. Cancel in a dialog).
- **danger** — destructive actions (delete, remove). Always confirm intent first.

### Accessibility
- Uses a native \`<button>\` element — keyboard activation (Enter/Space) works automatically.
- \`disabled\` is reflected as an HTML attribute so \`[disabled]\` CSS selectors work.
- For icon-only buttons, pass an \`aria-label\` via the \`label\` prop.
        `,
      },
    },
  },
};

export default meta;

// ─────────────────────────────────────────────────────────────────────────────
// TYPE ALIAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * StoryObj<T> is Storybook's TypeScript generic for a single story.
 * T is the component type — Storybook uses it to type-check the 'args'.
 */
type Story = StoryObj<StampButton>;

// ─────────────────────────────────────────────────────────────────────────────
// STORIES (named exports)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default story — what most people see first.
 *
 * When a story only provides 'args', Storybook renders it by calling the
 * component with those props. The Controls panel shows all argTypes and
 * lets you tweak every prop live.
 *
 * 'name' overrides the sidebar label (default would be "Default").
 */
export const Default: Story = {
  name: 'Playground',
  args: {
    variant: 'solid',
    size: 'md',
  },
  /**
   * render()
   * Optional. Provide this when you need custom markup around the component
   * (slots, multiple elements, wrapper divs).
   *
   * 'args' here are the current Control values — they update live as the
   * user tweaks sliders/dropdowns in the Controls panel.
   */
  render: (args) => html`
    <stamp-button
      variant=${args.variant}
      size=${args.size}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      type=${args.type ?? 'button'}
      label=${args.label ?? ''}
    >
      Click me
    </stamp-button>
  `,
};

/**
 * AllVariants — shows every variant side by side.
 *
 * This story has no Controls — it's purely illustrative. We set
 * parameters.controls.disable = true to hide the empty Controls panel.
 *
 * The 'name' field sets the sidebar label.
 */
export const AllVariants: Story = {
  name: 'All Variants',
  parameters: {
    controls: { disable: true },  // no controls for showcase stories
    docs: {
      description: {
        story: 'All four variants rendered at md size for direct comparison.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
      <stamp-button variant="solid">Solid</stamp-button>
      <stamp-button variant="outline">Outline</stamp-button>
      <stamp-button variant="ghost">Ghost</stamp-button>
      <stamp-button variant="danger">Danger</stamp-button>
    </div>
  `,
};

/**
 * Sizes — all three sizes for each variant.
 */
export const Sizes: Story = {
  name: 'All Sizes',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      ${(['solid', 'outline', 'ghost', 'danger'] as const).map(variant => html`
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <stamp-button variant=${variant} size="sm">Small</stamp-button>
          <stamp-button variant=${variant} size="md">Medium</stamp-button>
          <stamp-button variant=${variant} size="lg">Large</stamp-button>
        </div>
      `)}
    </div>
  `,
};

/**
 * States — disabled and loading for each variant.
 */
export const States: Story = {
  name: '🔁 States',
  parameters: { controls: { disable: true } },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; gap: 1rem; align-items: center;">
        <stamp-button variant="solid" disabled>Solid disabled</stamp-button>
        <stamp-button variant="outline" disabled>Outline disabled</stamp-button>
        <stamp-button variant="ghost" disabled>Ghost disabled</stamp-button>
      </div>
      <div style="display: flex; gap: 1rem; align-items: center;">
        <stamp-button variant="solid" loading>Saving…</stamp-button>
        <stamp-button variant="outline" loading>Processing…</stamp-button>
        <stamp-button variant="danger" loading>Deleting…</stamp-button>
      </div>
    </div>
  `,
};

/**
 * Solid, Outline, Ghost, Danger — individual stories for each variant.
 *
 * These individual stories let Chromatic take a focused snapshot of each
 * variant. When the 'danger' button changes visually, Chromatic flags only
 * the Danger story, not the whole AllVariants story.
 *
 * They also make the Docs page show each variant in its own section.
 */
export const Solid: Story = {
  args: { variant: 'solid' },
  render: (args) => html`
    <stamp-button variant=${args.variant} size=${args.size ?? 'md'} ?disabled=${args.disabled} ?loading=${args.loading}>
      Save changes
    </stamp-button>
  `,
};

export const Outline: Story = {
  args: { variant: 'outline' },
  render: (args) => html`
    <stamp-button variant=${args.variant} size=${args.size ?? 'md'} ?disabled=${args.disabled} ?loading=${args.loading}>
      Cancel
    </stamp-button>
  `,
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
  render: (args) => html`
    <stamp-button variant=${args.variant} size=${args.size ?? 'md'} ?disabled=${args.disabled} ?loading=${args.loading}>
      Learn more
    </stamp-button>
  `,
};

export const Danger: Story = {
  args: { variant: 'danger' },
  render: (args) => html`
    <stamp-button variant=${args.variant} size=${args.size ?? 'md'} ?disabled=${args.disabled} ?loading=${args.loading}>
      Delete account
    </stamp-button>
  `,
};

/**
 * A11yCheck — a story designed to surface accessibility issues.
 *
 * storybook/addon-a11y runs axe-core on every story, but this one is
 * specifically constructed to verify the tricky edge cases:
 *   - Icon-only button: needs aria-label
 *   - Loading button: needs aria-busy
 *   - Disabled button: needs aria-disabled
 *
 * Open the "Accessibility" panel in Storybook to see the axe report.
 */
export const A11yCheck: Story = {
  name: '♿ A11y Check',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Verify accessibility for icon-only, loading, and disabled states.',
      },
    },
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
        ],
      },
    },
  },
  render: () => html`
    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
      <!-- icon-only: must have label prop for aria-label -->
      <stamp-button variant="solid" label="Save document">💾</stamp-button>
      <!-- loading: aria-busy should be true -->
      <stamp-button variant="solid" loading label="Saving document">💾</stamp-button>
      <!-- disabled: aria-disabled should be true, pointer-events none -->
      <stamp-button variant="solid" disabled>Disabled</stamp-button>
    </div>
  `,
};
