import { LitElement, css, type CSSResultGroup } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * Shared base for all Stamp components.
 *
 * Token injection: because Lit uses Shadow DOM, global CSS variables from
 * the host page *do* pierce the shadow boundary (CSS custom properties are
 * inherited). So components can reference var(--stamp-*) without explicitly
 * importing tokens.css into every shadow root — as long as the consumer
 * loads @stamp-ds/tokens/css once at the document root.
 *
 * reflect: true — mirrors the JS property back to an HTML attribute so
 * CSS attribute selectors work: :host([disabled]) { opacity: 0.38 }
 */
export abstract class StampElement extends LitElement {
  @property({ reflect: true })
  size: 'sm' | 'md' | 'lg' = 'md';

  @property({ type: Boolean, reflect: true })
  disabled = false;

  static styles: CSSResultGroup = css`
    :host {
      box-sizing: border-box;
      font-family: var(--stamp-typography-family-sans);
    }
    :host([disabled]) {
      opacity: var(--stamp-opacity-disabled);
      pointer-events: none;
      cursor: not-allowed;
    }
  `;
}
