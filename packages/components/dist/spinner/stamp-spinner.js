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
 * stamp-spinner — loading indicator.
 *
 * Accessibility:
 * - role="status" is a polite live region: screen readers announce the
 *   aria-label when the spinner appears, without interrupting speech.
 * - The SVG is aria-hidden because the role/label on the host is enough.
 * - Use aria-label to customise the announcement (default: "Loading").
 */
let StampSpinner = class StampSpinner extends StampElement {
    constructor() {
        super(...arguments);
        this.label = 'Loading';
    }
    render() {
        return html `
      <svg
        role="status"
        aria-label=${this.label}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Background track -->
        <circle cx="50" cy="50" r="42" stroke="currentColor" stroke-width="8" opacity="0.2"/>
        <!-- Spinning arc -->
        <circle cx="50" cy="50" r="42" stroke-width="8" />
      </svg>
    `;
    }
};
StampSpinner.styles = [
    StampElement.styles,
    css `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      :host([size='sm']) { width: 1rem;    height: 1rem; }
      :host([size='md']),
      :host           { width: 1.5rem;   height: 1.5rem; }
      :host([size='lg']) { width: 2.5rem; height: 2.5rem; }

      svg {
        width: 100%;
        height: 100%;
        animation: spin var(--stamp-motion-duration-slower) linear infinite;
      }

      circle {
        stroke: currentColor;
        stroke-linecap: round;
        /* stroke-dasharray creates the "gap" in the ring.
           264 ≈ circumference of r=42 circle. 220/264 = ~83% filled. */
        stroke-dasharray: 220 264;
        stroke-dashoffset: 0;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `,
];
__decorate([
    property()
], StampSpinner.prototype, "label", void 0);
StampSpinner = __decorate([
    customElement('stamp-spinner')
], StampSpinner);
export { StampSpinner };
//# sourceMappingURL=stamp-spinner.js.map