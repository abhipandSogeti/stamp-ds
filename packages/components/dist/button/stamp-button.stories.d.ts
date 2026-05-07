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
import type { StampButton } from './stamp-button.js';
import './stamp-button.js';
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
declare const meta: Meta<StampButton>;
export default meta;
/**
 * StoryObj<T> is Storybook's TypeScript generic for a single story.
 * T is the component type — Storybook uses it to type-check the 'args'.
 */
type Story = StoryObj<StampButton>;
/**
 * Default story — what most people see first.
 *
 * When a story only provides 'args', Storybook renders it by calling the
 * component with those props. The Controls panel shows all argTypes and
 * lets you tweak every prop live.
 *
 * 'name' overrides the sidebar label (default would be "Default").
 */
export declare const Default: Story;
/**
 * AllVariants — shows every variant side by side.
 *
 * This story has no Controls — it's purely illustrative. We set
 * parameters.controls.disable = true to hide the empty Controls panel.
 *
 * The 'name' prefix '📋' groups it visually in the sidebar.
 */
export declare const AllVariants: Story;
/**
 * Sizes — all three sizes for each variant.
 */
export declare const Sizes: Story;
/**
 * States — disabled and loading for each variant.
 */
export declare const States: Story;
/**
 * Solid, Outline, Ghost, Danger — individual stories for each variant.
 *
 * These individual stories let Chromatic take a focused snapshot of each
 * variant. When the 'danger' button changes visually, Chromatic flags only
 * the Danger story, not the whole AllVariants story.
 *
 * They also make the Docs page show each variant in its own section.
 */
export declare const Solid: Story;
export declare const Outline: Story;
export declare const Ghost: Story;
export declare const Danger: Story;
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
export declare const A11yCheck: Story;
//# sourceMappingURL=stamp-button.stories.d.ts.map