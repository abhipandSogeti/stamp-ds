import { html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { StampElement } from '../base/StampElement.js';

/**
 * stamp-checkbox
 *
 * Accessibility:
 * - Wraps a native <input type="checkbox"> so all browser-native keyboard
 *   handling (Space to toggle) and form association work automatically.
 * - indeterminate state is set via JS property (cannot be set via HTML
 *   attribute) in updated() — Lit calls updated() after every render.
 * - aria-checked="mixed" is set when indeterminate, per ARIA spec.
 */
@customElement('stamp-checkbox')
export class StampCheckbox extends StampElement {
  static styles = [
    StampElement.styles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--stamp-space-component-gap-sm);
        cursor: pointer;
      }
      :host([disabled]) { cursor: not-allowed; }

      .checkbox-wrapper {
        position: relative;
        width: 1.125rem;
        height: 1.125rem;
        flex-shrink: 0;
      }

      input[type='checkbox'] {
        position: absolute;
        inset: 0;
        opacity: 0;
        margin: 0;
        width: 100%;
        height: 100%;
        cursor: inherit;
      }

      .box {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        border: 1.5px solid var(--stamp-color-border-default);
        border-radius: var(--stamp-radius-xs);
        background: var(--stamp-color-surface-elevated);
        transition:
          background var(--stamp-motion-duration-fast) var(--stamp-motion-easing-ease-out),
          border-color var(--stamp-motion-duration-fast) var(--stamp-motion-easing-ease-out);
        pointer-events: none;
      }

      input:checked ~ .box,
      input:indeterminate ~ .box {
        background: var(--stamp-color-brand-primary);
        border-color: var(--stamp-color-brand-primary);
      }

      .box svg { display: none; color: white; }
      input:checked ~ .box svg.check { display: block; }
      input:indeterminate ~ .box svg.dash { display: block; }

      /* Focus ring — only for keyboard navigation */
      input:focus-visible ~ .box {
        box-shadow:
          0 0 0 3px var(--stamp-color-brand-primary-subtle),
          0 0 0 5px var(--stamp-color-border-focus);
      }

      label {
        font-size: var(--stamp-input-font-size);
        color: var(--stamp-color-text-primary);
        cursor: inherit;
        user-select: none;
      }
    `,
  ];

  @property({ type: Boolean, reflect: true }) checked = false;
  @property({ type: Boolean }) indeterminate = false;
  @property() label = '';
  @property() name = '';
  @property() value = '';

  @query('input') private _input!: HTMLInputElement;

  updated(changed: Map<string, unknown>) {
    if (changed.has('indeterminate') && this._input) {
      this._input.indeterminate = this.indeterminate;
    }
  }

  private _handleChange(e: Event) {
    const input = e.target as HTMLInputElement;
    this.checked = input.checked;
    this.indeterminate = false;
    this.dispatchEvent(new CustomEvent('stamp-change', {
      bubbles: true,
      composed: true,
      detail: { checked: this.checked, value: this.value },
    }));
  }

  render() {
    const uid = `stamp-cb-${this.name || Math.random().toString(36).slice(2, 7)}`;
    return html`
      <div class="checkbox-wrapper">
        <input
          id=${uid}
          type="checkbox"
          name=${this.name}
          value=${this.value}
          .checked=${this.checked}
          ?disabled=${this.disabled}
          aria-checked=${this.indeterminate ? 'mixed' : String(this.checked)}
          @change=${this._handleChange}
        />
        <div class="box" aria-hidden="true">
          <svg class="check" width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg class="dash" width="10" height="2" viewBox="0 0 10 2" fill="none">
            <path d="M1 1H9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
      ${this.label ? html`<label for=${uid}>${this.label}</label>` : html`<slot></slot>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'stamp-checkbox': StampCheckbox; }
}
