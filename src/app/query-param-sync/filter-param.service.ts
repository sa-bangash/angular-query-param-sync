import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  takeUntil,
} from 'rxjs/operators';

interface StoreFilter {
  save(key: string, value: string): void;
  query(key: string): any;
}

@Injectable()
export class FilterParamService {
  private ctrl: AbstractControl | any;

  private queryParamName: string;

  private queryParamTo: (value: any) => any;

  private queryParamFrom: (value: any) => any;

  storageSync: StoreFilter;

  destory$ = new Subject();
  constructor(private router: Router, private activedRoute: ActivatedRoute) {}

  async init(
    crtl: AbstractControl,
    config: { queryParamName: string; storage?: StoreFilter }
  ) {
    this.ctrl = crtl;
    this.storageSync = config.storage;
    this.queryParamName = config.queryParamName;
    const queryParamData = this.getQueryParam();
    const storageData = this.getFromStorage();
    if (queryParamData) {
      this.patchValue(queryParamData);
      this.saveToStorage(queryParamData);
    } else if (storageData) {
      this.patchValue(storageData);
      await this.initParam().then((resp) => {
        console.log('afterinit', resp);
      });
    }

    this.control.valueChanges
      ?.pipe(
        debounceTime(500),
        distinctUntilChanged(isEqual),
        takeUntil(this.destory$)
      )
      .subscribe((resp) => {
        this.saveToStorage(resp);
        this.updateQueryParam();
      });
    this.activedRoute.queryParams
      .pipe(
        takeUntil(this.destory$),
        filter(() => !this.isQueryAndFormSync())
      )
      .subscribe((resp) => {
        console.log('called');
        const data = this.getQueryParam();
        this.patchValue(data);
        this.saveToStorage(data);
      });
  }

  private initParam() {
    return this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: {
        [this.key]: this.getDataForQueryParam(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  getDataForQueryParam() {
    let value = this.value;
    if (typeof this.queryParamTo === 'function') {
      value = this.queryParamTo(this.value);
    } else if (this.control instanceof FormGroup) {
      value = JSON.stringify(this.value);
    }
    return value;
  }

  get value() {
    if (this.ctrl) {
      return this.ctrl.value;
    }
    return this.control.value;
  }

  saveToStorage(data: any) {
    if (data === null) {
      data = '';
    }
    this.storageSync?.save(this.key, data);
  }

  patchValue(data: any) {
    if (data !== null) {
      this.control?.patchValue(data);
    }
  }

  getQueryParam() {
    const data = this.activedRoute.snapshot.queryParams;
    if (data && data[this.key]) {
      if (typeof this.queryParamFrom === 'function') {
        return this.queryParamFrom(data[this.key]);
      } else if (this.control instanceof FormGroup) {
        return JSON.parse(data[this.key]);
      }
      return data[this.key];
    }
    return null;
  }

  get control(): AbstractControl {
    return this.ctrl;
  }

  get key(): string {
    if (this.queryParamName) {
      return this.queryParamName;
    }
    return null;
  }

  getFromStorage() {
    return this.storageSync?.query(this.key);
  }

  isQueryAndFormSync(): Boolean {
    const param = this.getQueryParam();
    return isEqual(param, this.value);
  }

  updateQueryParam() {
    if (this.isQueryAndFormSync()) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: {
        [this.key]: this.getDataForQueryParam(),
      },
      queryParamsHandling: 'merge',
    });
  }

  destory() {
    this.destory$.next();
    this.destory$.complete();
  }
}
