/**
 * React wrappers for Stamp Web Components.
 *
 * Each wrapper is created with @lit-labs/react's createComponent(), which:
 * 1. Sets Lit reactive properties as JS properties (not HTML attributes),
 *    so booleans, objects, and arrays pass correctly.
 * 2. Maps React-style event props (onStampClick) to native CustomEvent
 *    listeners (stamp-click), bridging React's synthetic event model.
 * 3. Forwards refs to the underlying DOM element for imperative access.
 */
import React from 'react';
import { createComponent } from '@lit-labs/react';
import { StampButton }   from '@stamp-ds/components/button';
import { StampInput }    from '@stamp-ds/components/input';
import { StampCheckbox } from '@stamp-ds/components/checkbox';
import { StampBadge }    from '@stamp-ds/components/badge';
import { StampSpinner }  from '@stamp-ds/components/spinner';

export const Button = createComponent({
  tagName: 'stamp-button',
  elementClass: StampButton,
  react: React,
  events: {
    onStampClick: 'stamp-click',
  },
});

export const Input = createComponent({
  tagName: 'stamp-input',
  elementClass: StampInput,
  react: React,
  events: {
    onStampInput: 'stamp-input',
  },
});

export const Checkbox = createComponent({
  tagName: 'stamp-checkbox',
  elementClass: StampCheckbox,
  react: React,
  events: {
    onStampChange: 'stamp-change',
  },
});

export const Badge = createComponent({
  tagName: 'stamp-badge',
  elementClass: StampBadge,
  react: React,
});

export const Spinner = createComponent({
  tagName: 'stamp-spinner',
  elementClass: StampSpinner,
  react: React,
});
