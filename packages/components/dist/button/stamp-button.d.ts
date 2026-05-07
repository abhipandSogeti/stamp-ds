import { StampElement } from '../base/StampElement.js';
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
export declare class StampButton extends StampElement {
    static styles: import("lit").CSSResultGroup[];
    variant: ButtonVariant;
    type: ButtonType;
    loading: boolean;
    label: string;
    private _handleClick;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'stamp-button': StampButton;
    }
}
//# sourceMappingURL=stamp-button.d.ts.map