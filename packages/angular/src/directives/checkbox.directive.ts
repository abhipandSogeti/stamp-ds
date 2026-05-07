import { Directive, Input, Output, EventEmitter, ElementRef } from '@angular/core';

@Directive({ selector: 'stamp-checkbox', standalone: true })
export class CheckboxDirective {
  @Input() label = '';
  @Input() name = '';
  @Input() value = '';
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() stampChange = new EventEmitter<CustomEvent>();

  constructor(private el: ElementRef<HTMLElement>) {
    el.nativeElement.addEventListener('stamp-change', (e: Event) => {
      this.stampChange.emit(e as CustomEvent);
    });
  }
}
