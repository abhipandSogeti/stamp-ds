import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StampElement } from '../base/StampElement.js';
import { buttonStyles } from './stamp-button.css.js';

export type ButtonVariant = 'solid' | 'outline' | 'ghost' | 'danger';
export type ButtonType = 'button' | 'submit' | 'reset';

/**
 * stamp-button — primary interactive action element.
 *
 * Accessibility:
 * - Renders a native <button> element so Enter/Space activation,
 *   focus management, and form submission work without any extra JS.
 * - disabled is reflected as an attribute and native button disabled,
 *   so assistive tech announces it correctly.
 * - loading state adds aria-busy and shows a spinner; label remains
 *   visible so screen readers still announce the button's purpose.
 *
 * Events:
 * - stamp-click: CustomEvent fired on click (re-emits so framework
 *   wrappers can intercept before it bubbles to the host element).
 *
 * Usage:
 *   <stamp-button variant="solid">Save</stamp-button>
 *   <stamp-button variant="outline" size="sm">Cancel</stamp-button>
 *   <stamp-button variant="danger" loading>Deleting…</stamp-button>
 */
@customElement('stamp-button')
export class StampButton extends StampElement {
  static styles = [StampElement.styles, buttonStyles];

  @property({ reflect: true })
  variant: ButtonVariant = 'solid';

  @property({ reflect: true })
  type: ButtonType = 'button';

  @property({ type: Boolean, reflect: true })
  loading = false;

  @property()
  label = '';

  private _handleClick(e: MouseEvent) {
    if (this.disabled || this.loading) {
      e.stopPropagation();
      return;
    }
    this.dispatchEvent(new CustomEvent('stamp-click', {
      bubbles: true,
      composed: true,
      detail: { originalEvent: e },
    }));
  }

  render() {
    return html`
      <button
        type=${this.type}
        ?disabled=${this.disabled}
        aria-disabled=${this.disabled}
        aria-busy=${this.loading}
        aria-label=${this.label || undefined}
        @click=${this._handleClick}
      >
        ${this.loading ? html`<span class="spinner" aria-hidden="true"></span>` : ''}
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'stamp-button': StampButton;
  }
}
