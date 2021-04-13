import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[filterParamStorage]',
  exportAs: 'paramStorage',
})
export class FilterParamStorage {
  @Input('filterParamStorage') nameSpaceKey: string = '';

  save(controlKey: string, value: any) {
    localStorage.setItem(this.getBuildKey(controlKey), value);
  }

  query(controlName: string) {
    return localStorage.getItem(this.getBuildKey(controlName));
  }

  private getBuildKey(controlKey: string): string {
    if (this.nameSpaceKey) {
      return `${this.nameSpaceKey}_${controlKey}`;
    }
    return controlKey;
  }
}
