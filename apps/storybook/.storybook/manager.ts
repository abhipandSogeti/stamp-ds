import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

/**
 * STORYBOOK manager.ts — UI chrome customisation.
 *
 * The "manager" is the outer Storybook shell: sidebar, toolbar, panel tabs.
 * It runs in a separate frame from the preview (where stories render).
 *
 * addons.setConfig() controls sidebar and layout behaviour.
 * addons.setOptions() (legacy) also accepted here.
 *
 * create() builds a Storybook theme object from a set of named variables.
 * Storybook uses these to colour the sidebar, toolbar, and panel chrome.
 * We use Stamp's own brand colours — dogfooding the design system.
 */
addons.setConfig({
  theme: create({
    base: 'light',           // Start from the built-in light theme, then override.

    brandTitle:  'Stamp Design System',
    brandUrl:    'https://github.com/stamp-ds',
    brandTarget: '_blank',

    // Colour the sidebar and toolbar with Stamp tokens (hardcoded values here
    // because this file runs before tokens.css is loaded).
    colorPrimary:   '#1A5BB6',   // --stamp-color-brand-primary
    colorSecondary: '#FF8800',   // --stamp-color-brand-secondary

    // App chrome colours
    appBg:          '#F5F7FA',   // sidebar background
    appContentBg:   '#FFFFFF',   // main content area
    appBorderColor: '#DDE2EC',   // sidebar/panel border
    appBorderRadius: 8,

    // Typography
    fontBase:    '"Inter", system-ui, sans-serif',
    fontCode:    '"JetBrains Mono", monospace',

    // Text colours
    textColor:        '#111827',
    textInverseColor: '#FFFFFF',
    textMutedColor:   '#6B7280',

    // Toolbar colours
    barBg:            '#FFFFFF',
    barSelectedColor: '#1A5BB6',
    barHoverColor:    '#1A5BB6',
  }),

  /**
   * sidebar
   * Controls sidebar panel behaviour.
   * showRoots: true = top-level groups in the story hierarchy appear as
   * collapsible sections (e.g. "Components", "Tokens").
   * collapsedRoots: [] = all roots expanded by default.
   */
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
  },

  /**
   * enableShortcuts: true = keyboard shortcuts work (press ? to see them).
   */
  enableShortcuts: true,
});
