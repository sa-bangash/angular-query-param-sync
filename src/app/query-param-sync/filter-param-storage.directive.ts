import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[filterParamStorage]',
  exportAs: 'paramStorage',
})
export class FilterParamStorage {
  @Input('filterParamStorage') nameSpaceKey: string = '';
  @Input() storageTo: (value: any) => any;

  getKey(queryKey: string) {
    if (this.nameSpaceKey) {
      return `__filter__${this.nameSpaceKey}`;
    }
    return `__filter__${queryKey}`;
  }
  save(queryKey: string, value: any) {
    let data = this.getCollection();
    let param = value;
    if (this.storageTo instanceof Function) {
      param = this.storageTo(value);
    }
    localStorage.setItem(
      this.getKey(queryKey),
      JSON.stringify({
        ...data,
        [queryKey]: param,
      })
    );
  }
  getCollection() {
    return JSON.parse(localStorage.getItem(this.getKey(null)));
  }
  query(queryKey: string) {
    if (!this.nameSpaceKey) {
      return localStorage.getItem(this.getKey(queryKey));
    }
    const data = this.getCollection();
    if (data) {
      return data[queryKey];
    }
  }
}
