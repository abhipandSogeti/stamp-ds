import { Directive, Input } from '@angular/core';
import type { BadgeVariant } from '../../components/src/badge';

@Directive({ selector: 'stamp-badge', standalone: true })
export class BadgeDirective {
  @Input() variant: BadgeVariant = 'neutral';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() live = false;
}
