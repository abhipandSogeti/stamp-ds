import { Directive, Input } from '@angular/core';

@Directive({ selector: 'stamp-spinner', standalone: true })
export class SpinnerDirective {
  @Input() label = 'Loading';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
}
