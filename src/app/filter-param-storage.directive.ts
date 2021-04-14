import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[filterParamStorage]',
  exportAs: 'paramStorage',
})
export class FilterParamStorage {
  @Input('filterParamStorage') nameSpaceKey: string = '';

  save(controlKey: string, value: any) {
    if (!this.nameSpaceKey) {
      localStorage.setItem(controlKey, value);
      return;
    }
    const data = this.getCollection();
    localStorage.setItem(
      this.nameSpaceKey,
      JSON.stringify({
        ...data,
        [controlKey]: value,
      })
    );
  }
  getCollection() {
    return JSON.parse(localStorage.getItem(this.nameSpaceKey));
  }
  query(controlName: string) {
    if (!this.nameSpaceKey) {
      return localStorage.getItem(controlName);
    }
    const data = this.getCollection();
    if (data) {
      return data[controlName];
    }
  }
}
