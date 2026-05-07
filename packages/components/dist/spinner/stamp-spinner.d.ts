import { StampElement } from '../base/StampElement.js';
/**
 * stamp-spinner — loading indicator.
 *
 * Accessibility:
 * - role="status" is a polite live region: screen readers announce the
 *   aria-label when the spinner appears, without interrupting speech.
 * - The SVG is aria-hidden because the role/label on the host is enough.
 * - Use aria-label to customise the announcement (default: "Loading").
 */
export declare class StampSpinner extends StampElement {
    static styles: import("lit").CSSResultGroup[];
    label: string;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'stamp-spinner': StampSpinner;
    }
}
//# sourceMappingURL=stamp-spinner.d.ts.map