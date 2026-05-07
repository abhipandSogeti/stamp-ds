import { StampElement } from '../base/StampElement.js';
export declare class StampInput extends StampElement {
    static styles: import("lit").CSSResultGroup[];
    label: string;
    placeholder: string;
    type: string;
    value: string;
    name: string;
    helper: string;
    error: string;
    required: boolean;
    readonly: boolean;
    private _uid;
    private _handleInput;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'stamp-input': StampInput;
    }
}
//# sourceMappingURL=stamp-input.d.ts.map