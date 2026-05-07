var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StampElement } from '../base/StampElement.js';
import { buttonStyles } from './stamp-button.css.js';
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
let StampButton = class StampButton extends StampElement {
    constructor() {
        super(...arguments);
        this.variant = 'solid';
        this.type = 'button';
        this.loading = false;
        this.label = '';
    }
    _handleClick(e) {
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
        return html `
      <button
        type=${this.type}
        ?disabled=${this.disabled}
        aria-disabled=${this.disabled}
        aria-busy=${this.loading}
        aria-label=${this.label || undefined}
        @click=${this._handleClick}
      >
        ${this.loading ? html `<span class="spinner" aria-hidden="true"></span>` : ''}
        <slot></slot>
      </button>
    `;
    }
};
StampButton.styles = [StampElement.styles, buttonStyles];
__decorate([
    property({ reflect: true })
], StampButton.prototype, "variant", void 0);
__decorate([
    property({ reflect: true })
], StampButton.prototype, "type", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], StampButton.prototype, "loading", void 0);
__decorate([
    property()
], StampButton.prototype, "label", void 0);
StampButton = __decorate([
    customElement('stamp-button')
], StampButton);
export { StampButton };
//# sourceMappingURL=stamp-button.js.map