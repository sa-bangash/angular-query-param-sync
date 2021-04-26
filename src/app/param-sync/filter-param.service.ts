import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { MataData, QueryParamFilterConfig } from './param.model';
import { ParamConfigService } from './paramConfigService';
import { CONTROL_TYPES, isObjectEmpty, parse } from './utils';
export class FilterParamService {
  private _mataData: MataData[];
  private paramConfig: ParamConfigService[] = [];
  private source: FormGroup;
  private storageName: string;

  destory$ = new Subject();
  constructor(private router: Router, private activedRoute: ActivatedRoute) {}

  async initilize(config: QueryParamFilterConfig) {
    for (let mata of config.mataData) {
      this.paramConfig.push(
        new ParamConfigService(this.activedRoute, config.source, mata)
      );
    }
    this.source = config.source;
    this._mataData = config.mataData;
    this.storageName = config.storageName;
    await this.initUrlFromStorage();
    return this;
  }

  async resolveTheResolver(): Promise<any> {
    return Promise.all(
      this.paramConfig
        .filter((mata) => mata.resolverFn)
        .map((mata) => {
          return mata.resolver();
        })
    );
  }

  async initUrlFromStorage() {
    const queryParamData = this.getQueryParam();
    if (isObjectEmpty(queryParamData)) {
      const storageParam = this.getFromStorage();
      if (storageParam) {
        await this.initParamByString(storageParam);
      }
    }
  }
  async sync() {
    const queryParamData = this.getQueryParam();
    if (!isObjectEmpty(queryParamData)) {
      this.patchValue(queryParamData);
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
    for (let mata of this.paramConfig) {
      result[mata.queryName] = mata.serialized();
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
      this.paramConfig.forEach((config) => {
        result[config.queryName] = config.patch();
      });
      this.control?.patchValue(result);
    } else {
      this.control.reset();
    }
  }

  getQueryParam() {
    const data = this.activedRoute.snapshot.queryParams;
    if (Object.keys(data).length) {
      let parseData: Record<string, any> = {};

      this.paramConfig.forEach((mata) => {
        parseData[mata.queryName] = mata.parse();
      });
      return parseData;
    }
    return data;
  }

  get control(): AbstractControl {
    return this.source;
  }

  isQueryAndFormSync(): Boolean {
    for (let mata of this.paramConfig) {
      if (!mata.isEqule()) {
        return false;
      }
    }
    return true;
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
