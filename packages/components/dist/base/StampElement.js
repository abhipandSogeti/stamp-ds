var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, css } from 'lit';
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
export class StampElement extends LitElement {
    constructor() {
        super(...arguments);
        this.size = 'md';
        this.disabled = false;
    }
}
StampElement.styles = css `
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
__decorate([
    property({ reflect: true })
], StampElement.prototype, "size", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], StampElement.prototype, "disabled", void 0);
//# sourceMappingURL=StampElement.js.map