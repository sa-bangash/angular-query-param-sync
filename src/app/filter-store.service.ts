import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FilterStoreService {
  featureKey: string = '';
  setFeatureKey(value: string) {
    this.featureKey = value;
  }
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
