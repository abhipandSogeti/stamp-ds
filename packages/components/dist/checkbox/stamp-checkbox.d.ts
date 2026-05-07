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
export declare class StampCheckbox extends StampElement {
    static styles: import("lit").CSSResultGroup[];
    checked: boolean;
    indeterminate: boolean;
    label: string;
    name: string;
    value: string;
    private _input;
    updated(changed: Map<string, unknown>): void;
    private _handleChange;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'stamp-checkbox': StampCheckbox;
    }
}
//# sourceMappingURL=stamp-checkbox.d.ts.map