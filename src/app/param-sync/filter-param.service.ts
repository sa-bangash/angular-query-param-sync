import { Injectable } from '@angular/core';
import { AbstractControl, Form, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual, isEqualWith } from 'lodash';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  skip,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { MataData, QueryParamFilterConfig } from './param.model';
import { CONTROL_TYPES, parse } from './utils';
export class FilterParamService {
  private _mataData: MataData[];
  private source: FormGroup;
  private storageName: string;

  destory$ = new Subject();
  constructor(
    private router: Router,
    private activedRoute: ActivatedRoute,
    private config: QueryParamFilterConfig
  ) {
    this.initilize(this.config);
  }

  private initilize(config: QueryParamFilterConfig) {
    this.source = config.source;
    this._mataData = config.mataData;
    this.storageName = config.storageName;
  }

  async sync() {
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
        takeUntil(this.destory$),
        filter(() => !this.isQueryAndFormSync())
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
    const paramData = data || this.serilizeParam();
    return this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: paramData,
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  serilizeParam(): Record<string, string> {
    let result: Record<string, string> = {};
    for (let mata of this._mataData) {
      const paramValue = this.source.get(mata.queryName).value;
      const serilizedValue = mata.serializer?.(paramValue) || paramValue;
      result[mata.queryName] = serilizedValue || null;
    }
    return result;
  }

  get value() {
    if (this.source) {
      return this.source.value;
    }
    return this.control.value;
  }

  patchValue(data: any) {
    if (data !== null) {
      let result: Record<string, any> = {};
      for (let mata of this._mataData) {
        if (mata.patch) {
          result[mata.queryName] = mata.patch(data[mata.queryName]);
        } else {
          result[mata.queryName] = data[mata.queryName];
        }
      }
      this.control?.patchValue(result);
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
          if (mata.parser) {
            parseData[mata.queryName] = mata.parser(data[mata.queryName]);
          } else {
            if (data[mata.queryName] && mata.type) {
              parseData[mata.queryName] = parse(
                data[mata.queryName],
                mata.type
              );
            } else {
              parseData[mata.queryName] = data[mata.queryName];
            }
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
    const formValue = this.value;
    let isSame = true;
    for (let mata of this._mataData) {
      if (mata.compareWith) {
        isSame = mata.compareWith(
          param[mata.queryName],
          formValue[mata.queryName]
        );
      } else {
        isSame = isEqual(param[mata.queryName], formValue[mata.queryName]);
      }
      if (!isSame) {
        return false;
      }
    }
    return isSame;
  }

  updateQueryParam() {
    this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: {
        ...this.serilizeParam(),
      },
      queryParamsHandling: 'merge',
    });
  }

  destory() {
    this.destory$.next();
    this.destory$.complete();
  }
}
