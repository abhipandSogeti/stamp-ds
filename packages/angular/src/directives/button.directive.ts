import { Directive, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import type { ButtonVariant } from '@stamp-ds/components/button';

/**
 * ButtonDirective wraps <stamp-button> for Angular.
 *
 * Why a Directive instead of a Component?
 * The Web Component handles its own rendering. The directive's only job
 * is to provide typed @Input() bindings and @Output() event mappings so
 * Angular templates get type-checking and IDE autocomplete.
 */
@Directive({ selector: 'stamp-button', standalone: true })
export class ButtonDirective {
  @Input() variant: ButtonVariant = 'solid';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() stampClick = new EventEmitter<CustomEvent>();

  constructor(private el: ElementRef<HTMLElement>) {
    el.nativeElement.addEventListener('stamp-click', (e: Event) => {
      this.stampClick.emit(e as CustomEvent);
    });
  }
}
