import type { Preview } from '@storybook/web-components';
import { html } from 'lit';

/**
 * STORYBOOK preview.ts — global story configuration.
 *
 * This file runs in the BROWSER (inside the Storybook preview iframe),
 * unlike main.ts which runs in Node. You can import CSS, set up globals,
 * and add decorators that wrap every single story.
 *
 * Execution order:
 *   1. This file is evaluated once when Storybook loads.
 *   2. parameters/decorators/globalTypes are merged with story-level config.
 *   3. Story-level config wins over global config (specificity cascade).
 */

/**
 * TOKEN INJECTION
 * Why: Lit uses Shadow DOM, but CSS custom properties (--stamp-*) ARE
 * inherited across shadow boundaries. So we only need to load tokens.css
 * once on the document root and every Web Component inside any shadow root
 * can reference var(--stamp-color-brand-primary) etc.
 *
 * We import both light and dark tokens. The decorator below switches
 * which set is "active" by toggling a data-theme attribute on <html>.
 */
// ?url tells Vite: "don't inject this CSS as a <style> tag — give me the
// served URL as a string instead." We then inject it ourselves via a <link>
// element so we can swap href at runtime for dark mode switching.
//
// Relative from .storybook/ → ../../.. → stamp-ds root → packages/tokens/dist/
// TypeScript understands ?url because of the vite-env.d.ts reference above.
import './docs.css';
import lightTokensUrl from '../../../packages/tokens/dist/css/tokens.css?url';
import darkTokensUrl  from '../../../packages/tokens/dist/css/tokens.dark.css?url';

/**
 * COMPONENT REGISTRATION
 * We do NOT import '@stamp-ds/components' here.
 *
 * Why: each story file already imports its own component source file:
 *   import './stamp-button.js';  ← Vite resolves this to stamp-button.ts
 *
 * That import runs the @customElement() decorator, calling
 * customElements.define('stamp-button', StampButton).
 *
 * If we also imported '@stamp-ds/components' here (which resolves to the
 * compiled dist/index.js), customElements.define() would be called a second
 * time with a DIFFERENT class object — the browser throws:
 *   DOMException: 'stamp-button' has already been defined
 * crashing the entire preview iframe with a blank screen.
 *
 * Each story self-registers. preview.ts only sets up global config.
 */

const preview: Preview = {

  /**
   * PARAMETERS
   * These are the default settings for ALL stories. Individual stories or
   * story files can override any of these by setting their own `parameters`.
   *
   * Think of parameters as "options passed to addons and the Storybook UI".
   * Each addon reads the parameters it cares about and ignores the rest.
   */
  parameters: {

    /**
     * backgrounds
     * The @storybook/addon-backgrounds toolbar button reads this to know
     * what background colour options to show.
     *
     * 'default' sets which option is pre-selected. We default to the
     * design system's surface colour so components look correct out of the box.
     */
    backgrounds: {
      default: 'Surface',
      values: [
        { name: 'Surface',      value: '#F5F7FA' },  // --stamp-color-surface-default
        { name: 'White',        value: '#FFFFFF' },
        { name: 'Dark surface', value: '#111827' },  // --stamp-color-surface-default (dark)
        { name: 'Brand blue',   value: '#1A5BB6' },
      ],
    },

    /**
     * viewport
     * The addon-viewport toolbar reads this. We define our own breakpoints
     * matching Stamp's layout tokens, plus keep the built-in device presets.
     */
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile (375px)',
          styles: { width: '375px', height: '812px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (768px)',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1280px)',
          styles: { width: '1280px', height: '900px' },
          type: 'desktop',
        },
        wide: {
          name: 'Wide (1440px)',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },

    /**
     * layout
     * Controls how the story is positioned in the preview iframe.
     * 'centered' = horizontally + vertically centred (good for components).
     * 'fullscreen' = fills the iframe (good for page-level stories).
     * 'padded' = centred with padding around edges.
     */
    layout: 'centered',

    /**
     * controls
     * These settings affect the Controls panel (the table of editable props).
     *
     * matchers: Storybook uses regex to auto-assign control types.
     *   - Properties matching /color/i get a colour-picker control.
     *   - Properties matching /date/i get a date-picker control.
     * expanded: true = show full ArgType descriptions by default (not collapsed).
     * sort: 'requiredFirst' = required props appear at the top of the table.
     */
    controls: {
      matchers: {
        color: /(color|bg|background|fill|stroke|tint)$/i,
        date:  /date/i,
      },
      expanded: true,
      sort: 'requiredFirst',
    },

    /**
     * a11y
     * Configuration passed to axe-core (the engine behind addon-a11y).
     * We enable WCAG 2.1 AA rules and disable a couple that produce false
     * positives in Storybook's sandboxed iframe environment.
     */
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'landmark-one-main', enabled: false },  // false positive in iframe
          { id: 'page-has-heading-one', enabled: false }, // not relevant per story
        ],
      },
    },

    /**
     * docs
     * Configuration for the auto-generated Docs page.
     * toc: true adds a Table of Contents sidebar to the docs page (lists
     * all story headings for easy navigation on long pages).
     */
    docs: {
      toc: true,
    },

    /**
     * options.storySort
     * Controls the sidebar order. Groups and stories not listed here fall
     * to the end in alphabetical order.
     */
    options: {
      storySort: {
        order: [
          'Stamp DS',
          ['Introduction', 'Getting Started', 'Design Tokens', 'Theming', 'Contributing'],
          'Components',
          ['Button', 'Input', 'Checkbox', 'Badge', 'Spinner', 'Icons'],
          '*',
        ],
      },
    },
  },

  /**
   * GLOBAL TYPES
   * globalTypes define custom toolbar items — dropdowns, buttons, icons —
   * that appear in the top toolbar of the Storybook UI.
   *
   * Each globalType has a 'toolbar' config that describes the UI control,
   * and a 'defaultValue' that sets the initial value.
   *
   * The current value of a globalType is available in every decorator and
   * story via the second argument: (args, { globals }) => globals.colorScheme
   */
  globalTypes: {
    colorScheme: {
      description: 'Toggle light / dark mode across all stories',
      toolbar: {
        title: 'Color Scheme',
        icon: 'sun',          // Storybook icon name from @storybook/icons
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark',  title: 'Dark',  icon: 'moon' },
        ],
        dynamicTitle: true,   // toolbar button shows the current selection
      },
      defaultValue: 'light',
    },
  },

  /**
   * DECORATORS
   * A decorator is a function that wraps every story with extra markup or logic.
   * Decorators compose from outer to inner: the last decorator listed is the
   * innermost wrapper around the actual story output.
   *
   * This single decorator:
   *  1. Reads the colorScheme global.
   *  2. Sets data-scheme="light|dark" on the preview wrapper div.
   *  3. Loads the correct token CSS file into the document <head> as a <link>.
   *     Swapping the link href triggers CSS custom property re-evaluation
   *     across every component on the page — no JS needed per component.
   *  4. Wraps the story in a div with the correct background and padding.
   *
   * The 'story' argument is a render function — call it to get the story output.
   */
  decorators: [
    (story, context) => {
      const scheme = context.globals['colorScheme'] ?? 'light';

      // Inject or update the token CSS link in <head>.
      // We only load ONE css file at a time — swapping href is instant.
      let link = document.getElementById('stamp-tokens') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.id = 'stamp-tokens';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      // lightTokensUrl / darkTokensUrl are Vite-resolved URLs (via ?url import).
      // Swapping href here re-evaluates ALL CSS custom properties across the
      // entire page — every shadow root picks up the new values automatically
      // because custom properties inherit across shadow boundaries.
      link.href = scheme === 'dark' ? darkTokensUrl : lightTokensUrl;

      // Set data-scheme on <html> so any CSS [data-scheme='dark'] rules work.
      document.documentElement.setAttribute('data-scheme', scheme);

      return html`
        <div
          data-scheme=${scheme}
          style="
            background: var(--stamp-color-surface-default, ${scheme === 'dark' ? '#111827' : '#F5F7FA'});
            padding: 2rem;
            min-height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
          "
        >
          ${story()}
        </div>
      `;
    },
  ],
};

export default preview;
