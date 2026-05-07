import { css } from 'lit';

export const buttonStyles = css`
  :host {
    display: inline-flex;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--stamp-space-component-gap-xs);
    padding: var(--stamp-button-padding-y) var(--stamp-button-padding-x);
    font-family: var(--stamp-typography-family-sans);
    font-size: var(--stamp-button-font-size);
    font-weight: var(--stamp-button-font-weight);
    line-height: 1.5;
    border-radius: var(--stamp-button-radius);
    border: 1.5px solid transparent;
    cursor: pointer;
    transition:
      background-color var(--stamp-motion-duration-fast) var(--stamp-motion-easing-ease-out),
      border-color     var(--stamp-motion-duration-fast) var(--stamp-motion-easing-ease-out),
      box-shadow       var(--stamp-motion-duration-fast) var(--stamp-motion-easing-ease-out);
    outline: none;
    white-space: nowrap;
    user-select: none;
    width: 100%;
  }

  /* Size variants */
  :host([size='sm']) button {
    padding: 0.25rem 0.75rem;
    font-size: var(--stamp-typography-size-12);
  }
  :host([size='lg']) button {
    padding: 0.625rem 1.5rem;
    font-size: var(--stamp-typography-size-16);
  }

  /* Solid (default) */
  :host([variant='solid']) button,
  button {
    background: var(--stamp-button-bg-default);
    color: var(--stamp-button-text-default);
    border-color: var(--stamp-button-border-default);
  }
  :host([variant='solid']) button:hover,
  button:hover {
    background: var(--stamp-button-bg-hover);
    border-color: var(--stamp-button-bg-hover);
  }

  /* Outline */
  :host([variant='outline']) button {
    background: transparent;
    color: var(--stamp-color-brand-primary);
    border-color: var(--stamp-color-brand-primary);
  }
  :host([variant='outline']) button:hover {
    background: var(--stamp-color-brand-primary-subtle);
  }

  /* Ghost */
  :host([variant='ghost']) button {
    background: transparent;
    color: var(--stamp-color-brand-primary);
    border-color: transparent;
  }
  :host([variant='ghost']) button:hover {
    background: var(--stamp-color-brand-primary-subtle);
  }

  /* Danger */
  :host([variant='danger']) button {
    background: var(--stamp-color-red-500);
    color: var(--stamp-color-neutral-0);
    border-color: var(--stamp-color-red-500);
  }
  :host([variant='danger']) button:hover {
    background: var(--stamp-color-red-700, #b91c1c);
  }

  /* Focus ring — visible only for keyboard nav (not mouse clicks).
     We use :focus-visible which browsers apply only when navigating by keyboard. */
  button:focus-visible {
    box-shadow: 0 0 0 3px var(--stamp-color-brand-primary-subtle),
                0 0 0 5px var(--stamp-button-border-focus);
  }

  /* Loading state */
  :host([loading]) button {
    pointer-events: none;
    opacity: 0.8;
  }

  .spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: var(--stamp-radius-full);
    animation: spin var(--stamp-motion-duration-slow) linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
