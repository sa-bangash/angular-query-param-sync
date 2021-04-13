import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[appFilterPermenentRetain]',
})
export class FilterPermenentRetainDirective {
  @Input('appFilterPermenentRetain') featureKey: string;

  save(controlKey: string, value: any) {
    localStorage.setItem(this.getBuildKey(controlKey), value);
  }

  query(controlName: string) {
    return localStorage.getItem(this.getBuildKey(controlName));
  }

  private getBuildKey(controlKey: string): string {
    if (this.featureKey) {
      return `${this.featureKey}_${controlKey}`;
    }
    return null;
  }
}
