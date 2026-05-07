import { LitElement, type CSSResultGroup } from 'lit';
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
export declare abstract class StampElement extends LitElement {
    size: 'sm' | 'md' | 'lg';
    disabled: boolean;
    static styles: CSSResultGroup;
}
//# sourceMappingURL=StampElement.d.ts.map