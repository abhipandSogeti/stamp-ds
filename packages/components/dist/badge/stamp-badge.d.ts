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
export declare class StampBadge extends StampElement {
    static styles: import("lit").CSSResultGroup[];
    variant: BadgeVariant;
    /** When true, wraps in role="status" so screen readers announce updates. */
    live: boolean;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'stamp-badge': StampBadge;
    }
}
//# sourceMappingURL=stamp-badge.d.ts.map