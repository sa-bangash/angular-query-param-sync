import { Injectable } from '@angular/core';
import { AbstractControl, Form, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  skip,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { CONTROL_TYPES, parse } from './utils';

interface StoreFilter {
  save(key: string, value: string): void;
  query(key: string): any;
}
interface QueryParamFilterConfig {
  source: FormGroup;
  mataData: MataData[];
  storageName?: string;
}
interface MataData {
  type?: CONTROL_TYPES;
  queryName: string;
}

export class FilterParamService {
  private _mataData: MataData[];
  private source: FormGroup;
  private storageName: string;
  private queryParamTo: (value: any) => any;

  private queryParamFrom: (value: any) => any;

  destory$ = new Subject();
  constructor(private router: Router, private activedRoute: ActivatedRoute) {
    this.router.navigateByUrl;
  }

  private initilize(config: QueryParamFilterConfig) {
    this.source = config.source;
    this._mataData = config.mataData;
    this.storageName = config.storageName;
  }

  async connect(config: QueryParamFilterConfig) {
    this.initilize(config);
    const queryParamData = this.getQueryParam();
    const storageSearch = this.getFromStorage();
    if (queryParamData) {
      this.patchValue(queryParamData);
    } else if (storageSearch) {
      await this.initParamByString(storageSearch);
    } else {
      await this.initParam().then((resp) => {
        console.log('init for form value', resp);
      });
    }

    this.control.valueChanges
      ?.pipe(
        debounceTime(500),
        distinctUntilChanged(isEqual),
        takeUntil(this.destory$)
      )
      .subscribe((resp) => {
        console.log('control value changes');
        this.updateQueryParam();
      });
    this.activedRoute.queryParams
      .pipe(
        takeUntil(this.destory$),
        tap((resp) => {
          console.log('param change occure');
          this.saveToStorage();
        }),
        filter(() => !this.isQueryAndFormSync())
      )
      .subscribe((resp) => {
        console.log('param changes subscribe called');
        const data = this.getQueryParam();
        this.patchValue(data);
        this.saveToStorage();
      });
    return queryParamData;
  }
  getFromStorage() {
    if (this.storageName) {
      const searchUrl = localStorage.getItem(this.storageName);
      if (searchUrl) {
        return searchUrl;
      }
    }
    return null;
  }
  saveToStorage() {
    const searchUrl = location.search;
    if (searchUrl && this.storageName) {
      localStorage.setItem(this.storageName, searchUrl);
    }
  }
  private initParamByString(data: string) {
    this.router.navigateByUrl(this.router.url + data, {
      replaceUrl: true,
    });
  }
  private initParam(data?: any) {
    const paramData = data || this.getDataForQueryParam();
    console.log(this.getDataForQueryParam());
    return this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: paramData,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  getDataForQueryParam() {
    let value = this.value;
    if (typeof this.queryParamTo === 'function') {
      value = this.queryParamTo(this.value);
    } else if (this.control instanceof FormGroup) {
      value = this.value;
    }
    return value;
  }

  get value() {
    if (this.source) {
      return this.source.value;
    }
    return this.control.value;
  }

  patchValue(data: any) {
    if (data !== null) {
      // for simple control than need to be set to null
      this.control?.patchValue(data);
    } else {
      this.control.reset();
    }
  }

  getQueryParam() {
    const data = this.activedRoute.snapshot.queryParams;
    if (Object.keys(data).length) {
      const mataData = this._mataData;
      let parseData: Record<string, any> = {};
      if (mataData) {
        for (const mata of mataData) {
          if (data[mata.queryName] && mata.type) {
            parseData[mata.queryName] = parse(data[mata.queryName], mata.type);
          } else {
            parseData[mata.queryName] = data[mata.queryName];
          }
        }
        return parseData;
      }
      return data;
    }
    return null;
  }

  get control(): AbstractControl {
    return this.source;
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
        ...this.getDataForQueryParam(),
      },
      queryParamsHandling: 'merge',
      // skipLocationChange: true,
    });
  }

  destory() {
    this.destory$.next();
    this.destory$.complete();
  }
}
