import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StampElement } from '../base/StampElement.js';

export type BadgeVariant = 'neutral' | 'brand' | 'danger' | 'success' | 'warning';

/**
 * stamp-badge — inline label for status, counts, or metadata.
 *
 * Accessibility:
 * - Static badges have no role (they're presentational metadata).
 * - Set `live` for badges whose content updates dynamically (e.g. unread
 *   count) — this adds role="status" which is an ARIA live region, causing
 *   screen readers to announce changes automatically.
 */
@customElement('stamp-badge')
export class StampBadge extends StampElement {
  static styles = [
    StampElement.styles,
    css`
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

  @property({ reflect: true }) variant: BadgeVariant = 'neutral';

  /** When true, wraps in role="status" so screen readers announce updates. */
  @property({ type: Boolean }) live = false;

  render() {
    return html`
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
}

declare global {
  interface HTMLElementTagNameMap { 'stamp-badge': StampBadge; }
}
