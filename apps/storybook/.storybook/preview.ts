import type { Preview } from '@storybook/web-components';
import { html } from 'lit';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

// ?url tells Vite: give us the served URL as a string so we can swap the
// href at runtime for dark mode. TypeScript understands ?url via vite-env.d.ts.
import './docs.css';
import lightTokensUrl from '@stamp-ds/tokens/css?url';
import darkTokensUrl  from '@stamp-ds/tokens/dark?url';

/**
 * COMPONENT REGISTRATION
 * Each story file imports and registers its own component. We don't import
 * '@stamp-ds/components' here because customElements.define() would be called
 * twice with a different class object, throwing a DOMException.
 */

const preview: Preview = {

  parameters: {

    backgrounds: {
      default: 'Surface',
      values: [
        { name: 'Surface',      value: '#F5F7FA' },
        { name: 'White',        value: '#FFFFFF' },
        { name: 'Dark surface', value: '#111827' },
        { name: 'Brand blue',   value: '#1A5BB6' },
      ],
    },

    viewport: {
      viewports: {
        mobile:  { name: 'Mobile (375px)',   styles: { width: '375px',  height: '812px'  }, type: 'mobile'  },
        tablet:  { name: 'Tablet (768px)',   styles: { width: '768px',  height: '1024px' }, type: 'tablet'  },
        desktop: { name: 'Desktop (1280px)', styles: { width: '1280px', height: '900px'  }, type: 'desktop' },
        wide:    { name: 'Wide (1440px)',     styles: { width: '1440px', height: '900px'  }, type: 'desktop' },
      },
    },

    layout: 'centered',

    controls: {
      matchers: {
        color: /(color|bg|background|fill|stroke|tint)$/i,
        date:  /date/i,
      },
      expanded: true,
      sort: 'requiredFirst',
    },

    a11y: {
      config: {
        rules: [
          { id: 'color-contrast',        enabled: true  },
          { id: 'landmark-one-main',     enabled: false }, // false positive in iframe
          { id: 'page-has-heading-one',  enabled: false }, // not relevant per story
        ],
      },
    },

    docs: { toc: true },

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

  decorators: [
    // withThemeByDataAttribute registers the official "Themes" toolbar button
    // in the Storybook manager and sets data-scheme on the story wrapper div.
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-scheme',
    }),

    // Swap token CSS files and wrap the story in a themed surface.
    // Reads context.globals.theme (the key used by withThemeByDataAttribute).
    (story, context) => {
      const scheme = (context.globals['theme'] as string) ?? 'light';

      let link = document.getElementById('stamp-tokens') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.id   = 'stamp-tokens';
        link.rel  = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = scheme === 'dark' ? darkTokensUrl : lightTokensUrl;
      document.documentElement.setAttribute('data-scheme', scheme);

      return html`
        <div
          data-scheme=${scheme}
          style="
            background: var(--stamp-color-surface-default, ${scheme === 'dark' ? '#111827' : '#F5F7FA'});
            color: var(--stamp-color-text-primary, ${scheme === 'dark' ? '#F5F7FA' : '#111827'});
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
