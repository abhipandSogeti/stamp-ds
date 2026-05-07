import { Directive, Input, Output, EventEmitter, ElementRef } from '@angular/core';

@Directive({ selector: 'stamp-input', standalone: true })
export class InputDirective {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() value = '';
  @Input() helper = '';
  @Input() error = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() stampInput = new EventEmitter<CustomEvent>();

  constructor(private el: ElementRef<HTMLElement>) {
    el.nativeElement.addEventListener('stamp-input', (e: Event) => {
      this.stampInput.emit(e as CustomEvent);
    });
  }
}
