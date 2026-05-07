import type { StorybookConfig } from '@storybook/web-components-vite';

/**
 * STORYBOOK main.ts — the master configuration file.
 *
 * This is the first file Storybook reads when it starts. Think of it as
 * the "webpack.config" of Storybook: it wires together the builder, the
 * addon list, and where to find story files.
 *
 * Storybook reads this file in a Node.js context (not the browser), so
 * you can use Node APIs here but NOT browser globals like window.
 */
const config: StorybookConfig = {

  /**
   * framework
   * Tells Storybook which rendering environment + build tool to use.
   * '@storybook/web-components-vite' means:
   *   - Rendering: native Web Components (no React/Vue wrapper)
   *   - Build tool: Vite (fast ESM-native dev server, instant HMR)
   *
   * Alternatives: react-vite, vue3-vite, angular, etc.
   */
  framework: '@storybook/web-components-vite',

  /**
   * stories
   * Glob patterns for story files. Storybook scans these paths and
   * registers every file it finds as a set of stories.
   *
   * We scan across all packages/ — this means every component package
   * can have stories co-located next to the source code, and Storybook
   * automatically picks them up. No manual registration needed.
   *
   * Pattern breakdown:
   *   ../../packages/         = go up two dirs to the monorepo root, then into packages/
   *   **                      = any subdirectory (components, react, etc.)
   *   /*.stories.@(ts|js)     = any .stories.ts or .stories.js file
   */
  stories: [
    // Standalone MDX documentation pages (Introduction, Getting Started, etc.)
    // Relative from .storybook/ → apps/storybook/docs/
    '../docs/**/*.mdx',

    // Paths are relative to .storybook/ (this file's directory).
    // ../../../packages → stamp-ds/packages/
    //
    // We scope to src/ to avoid picking up compiled dist/*.stories.js files.
    // Without /src/, Storybook would find both the TypeScript source AND the
    // compiled JavaScript output and register every story twice.
    '../../../packages/*/src/**/*.stories.@(ts|js)',
    '../../../packages/*/src/**/*.mdx',
  ],

  /**
   * addons
   * Storybook addons are plugins that extend the UI. Each entry adds a
   * panel, toolbar button, or background feature.
   *
   * Load order matters: addons listed first get the leftmost panel tab.
   */
  addons: [
    /**
     * @storybook/addon-docs
     * Auto-generates a "Docs" page for every component by combining:
     *   - The component's JSDoc comments
     *   - ArgTypes (derived from TypeScript types)
     *   - All stories rendered inline
     * You get a full API reference page for free, with zero extra work.
     */
    '@storybook/addon-docs',

    /**
     * @storybook/addon-a11y
     * Runs axe-core (the industry-standard accessibility engine) on the
     * rendered story. Shows violations in the "Accessibility" panel with:
     *   - Violation level (critical/serious/moderate/minor)
     *   - Affected DOM nodes highlighted in the preview
     *   - Links to WCAG criterion and fix guidance
     *
     * This is your automated WCAG 2.2 AA gate — it catches missing ARIA
     * labels, insufficient colour contrast, keyboard traps, etc.
     */
    '@storybook/addon-a11y',

    /**
     * @storybook/addon-themes
     * Adds a toolbar button to switch between named CSS class themes.
     * We'll configure it in preview.ts to toggle light/dark mode by
     * swapping the tokens.css / tokens.dark.css custom properties on
     * the document root.
     */
    '@storybook/addon-themes',

    /**
     * @storybook/addon-viewport
     * Adds a toolbar dropdown to simulate device screen sizes.
     * Built-in viewports: iPhone, iPad, desktop, etc.
     * You can also define custom viewports (e.g. a specific breakpoint).
     */
    '@storybook/addon-viewport',

    /**
     * @storybook/addon-backgrounds
     * Adds a toolbar button to switch the preview background colour.
     * Useful for testing components against different surfaces (white, dark, brand).
     */
    '@storybook/addon-backgrounds',

    /**
     * @chromatic-com/storybook
     * Connects Storybook to Chromatic's visual regression service.
     * In CI, Chromatic snapshots every story and diffs against the
     * approved baseline — catching unintended visual changes.
     */
    '@chromatic-com/storybook',
  ],

  /**
   * docs
   * Controls the auto-generated Docs pages.
   * autodocs: 'tag' means a Docs page is generated only for stories
   * that have `tags: ['autodocs']` in their meta. This keeps the sidebar
   * clean: you opt in per component rather than getting a docs page for
   * every single story file.
   */
  docs: {
    autodocs: 'tag',
  },

  /**
   * typescript
   * Storybook uses the TypeScript compiler to extract component prop
   * types and turn them into Controls automatically.
   * reactDocgen is set to false here because we're using Web Components,
   * not React — Storybook's web-components framework handles type
   * extraction differently (via custom elements manifest).
   */
  typescript: {
    check: false,
  },
};

export default config;
