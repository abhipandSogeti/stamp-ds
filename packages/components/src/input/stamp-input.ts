import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StampElement } from '../base/StampElement.js';

@customElement('stamp-input')
export class StampInput extends StampElement {
  static styles = [
    StampElement.styles,
    css`
      :host { display: block; }

      .field { display: flex; flex-direction: column; gap: var(--stamp-space-component-gap-xs); }

      label {
        font-size: var(--stamp-text-label-md-size);
        font-weight: var(--stamp-text-label-md-weight);
        color: var(--stamp-color-text-primary);
      }

      .required-mark { color: var(--stamp-color-text-danger); margin-left: 2px; }

      .input-wrapper {
        display: flex;
        align-items: center;
        border: 1.5px solid var(--stamp-input-border-default);
        border-radius: var(--stamp-input-radius);
        background: var(--stamp-input-bg-default);
        transition: border-color var(--stamp-motion-duration-fast) var(--stamp-motion-easing-ease-out);
        overflow: hidden;
      }

      .input-wrapper:focus-within {
        border-color: var(--stamp-input-border-focus);
        box-shadow: 0 0 0 3px var(--stamp-color-brand-primary-subtle);
      }

      :host([error]) .input-wrapper {
        border-color: var(--stamp-input-border-error);
      }

      slot[name='prefix']::slotted(*),
      slot[name='suffix']::slotted(*) {
        display: flex;
        align-items: center;
        padding: 0 var(--stamp-spacing-3);
        color: var(--stamp-color-text-tertiary);
      }

      input {
        flex: 1;
        padding: var(--stamp-input-padding-y) var(--stamp-input-padding-x);
        font-family: var(--stamp-typography-family-sans);
        font-size: var(--stamp-input-font-size);
        color: var(--stamp-input-text-default);
        background: transparent;
        border: none;
        outline: none;
        min-width: 0;
      }

      input::placeholder { color: var(--stamp-input-text-placeholder); }

      :host([disabled]) input {
        background: var(--stamp-input-bg-disabled);
        color: var(--stamp-input-text-disabled);
        cursor: not-allowed;
      }

      .hint {
        font-size: var(--stamp-text-label-sm-size);
        color: var(--stamp-color-text-secondary);
      }
      .error-msg {
        font-size: var(--stamp-text-label-sm-size);
        color: var(--stamp-color-text-danger);
      }
    `,
  ];

  @property() label = '';
  @property() placeholder = '';
  @property() type = 'text';
  @property() value = '';
  @property() name = '';
  @property() helper = '';
  @property({ reflect: true }) error = '';
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) readonly = false;

  @state() private _uid = `stamp-input-${Math.random().toString(36).slice(2, 9)}`;

  private _handleInput(e: Event) {
    this.value = (e.target as HTMLInputElement).value;
    this.dispatchEvent(new CustomEvent('stamp-input', {
      bubbles: true, composed: true, detail: { value: this.value },
    }));
  }

  render() {
    const descId = this.error ? `${this._uid}-error` : this.helper ? `${this._uid}-hint` : undefined;

    return html`
      <div class="field" part="field">
        ${this.label ? html`
          <label for=${this._uid}>
            ${this.label}
            ${this.required ? html`<span class="required-mark" aria-hidden="true">*</span>` : ''}
          </label>
        ` : ''}

        <div class="input-wrapper" part="wrapper">
          <slot name="prefix"></slot>
          <input
            id=${this._uid}
            type=${this.type}
            name=${this.name}
            .value=${this.value}
            placeholder=${this.placeholder}
            ?disabled=${this.disabled}
            ?required=${this.required}
            ?readonly=${this.readonly}
            aria-required=${this.required}
            aria-invalid=${!!this.error}
            aria-describedby=${descId ?? ''}
            @input=${this._handleInput}
          />
          <slot name="suffix"></slot>
        </div>

        ${this.error
          ? html`<span id="${this._uid}-error" class="error-msg" role="alert">${this.error}</span>`
          : this.helper
          ? html`<span id="${this._uid}-hint" class="hint">${this.helper}</span>`
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'stamp-input': StampInput; }
}
