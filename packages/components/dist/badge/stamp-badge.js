var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StampElement } from '../base/StampElement.js';
/**
 * stamp-badge — inline label for status, counts, or metadata.
 *
 * Accessibility:
 * - Static badges have no role (they're presentational metadata).
 * - Set `live` for badges whose content updates dynamically (e.g. unread
 *   count) — this adds role="status" which is an ARIA live region, causing
 *   screen readers to announce changes automatically.
 */
let StampBadge = class StampBadge extends StampElement {
    constructor() {
        super(...arguments);
        this.variant = 'neutral';
        /** When true, wraps in role="status" so screen readers announce updates. */
        this.live = false;
    }
    render() {
        return html `
      <span
        class="badge"
        part="badge"
        role=${this.live ? 'status' : undefined}
        aria-label=${this.live ? undefined : undefined}
      >
        <slot></slot>
      </span>
    `;
    }
};
StampBadge.styles = [
    StampElement.styles,
    css `
      :host { display: inline-flex; }

      .badge {
        display: inline-flex;
        align-items: center;
        gap: var(--stamp-space-component-gap-xs);
        padding: var(--stamp-badge-padding-y) var(--stamp-badge-padding-x);
        font-size: var(--stamp-badge-font-size);
        font-weight: var(--stamp-typography-weight-medium);
        line-height: 1.25;
        border-radius: var(--stamp-badge-radius);
        white-space: nowrap;
      }

      /* Variant colour pairs — bg + text from component tokens */
      :host([variant='neutral']) .badge,
      .badge {
        background: var(--stamp-badge-neutral-bg);
        color: var(--stamp-badge-neutral-text);
      }
      :host([variant='brand']) .badge {
        background: var(--stamp-badge-brand-bg);
        color: var(--stamp-badge-brand-text);
      }
      :host([variant='danger']) .badge {
        background: var(--stamp-badge-danger-bg);
        color: var(--stamp-badge-danger-text);
      }
      :host([variant='success']) .badge {
        background: var(--stamp-badge-success-bg);
        color: var(--stamp-badge-success-text);
      }
      :host([variant='warning']) .badge {
        background: var(--stamp-badge-warning-bg);
        color: var(--stamp-badge-warning-text);
      }

      /* Size overrides */
      :host([size='sm']) .badge { font-size: var(--stamp-typography-size-10); padding: 0 0.375rem; }
      :host([size='lg']) .badge { font-size: var(--stamp-typography-size-13); padding: 0.25rem 0.625rem; }
    `,
];
__decorate([
    property({ reflect: true })
], StampBadge.prototype, "variant", void 0);
__decorate([
    property({ type: Boolean })
], StampBadge.prototype, "live", void 0);
StampBadge = __decorate([
    customElement('stamp-badge')
], StampBadge);
export { StampBadge };
//# sourceMappingURL=stamp-badge.js.map