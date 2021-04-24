import { Injectable } from '@angular/core';

@Injectable()
export class FilterStoreService {
  nameSpaceKey: string = '';
  setFeatureKey(key: string) {
    this.nameSpaceKey = key;
  }
  storageTo: (value: any) => any;
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
    console.log('saving', this.getKey(queryKey), queryKey, param);
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
