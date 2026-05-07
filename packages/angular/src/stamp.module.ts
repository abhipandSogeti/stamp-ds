import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ButtonDirective }   from './directives/button.directive.js';
import { InputDirective }    from './directives/input.directive.js';
import { CheckboxDirective } from './directives/checkbox.directive.js';
import { BadgeDirective }    from './directives/badge.directive.js';
import { SpinnerDirective }  from './directives/spinner.directive.js';

const DIRECTIVES = [
  ButtonDirective,
  InputDirective,
  CheckboxDirective,
  BadgeDirective,
  SpinnerDirective,
];

/**
 * StampModule — import in any Angular module that uses Stamp components.
 *
 * This module exports Angular directive wrappers for the Stamp design system
 * web components. Each directive is listed in the DIRECTIVES array and then
 * re-exported so consuming modules only need to import StampModule once.
 *
 * CUSTOM_ELEMENTS_SCHEMA tells Angular's template compiler to allow unknown
 * elements with hyphenated tag names, such as <stamp-button>, <stamp-input>,
 * and others. Without this schema, Angular would report template errors for
 * custom elements it does not recognize.
 *
 * The actual custom elements must be defined before they are used. Importing
 * '@stamp-ds/components' once in your application bootstrap triggers the
 * registration of all Stamp web components via customElements.define().
 */
@NgModule({
  declarations: [],
  imports:  DIRECTIVES,
  exports:  DIRECTIVES,
  schemas:  [CUSTOM_ELEMENTS_SCHEMA],
})
export class StampModule {}
