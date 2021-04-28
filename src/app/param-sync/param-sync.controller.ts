import { AbstractControl, FormGroup } from '@angular/forms';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
  RouterEvent,
} from '@angular/router';
import { isEqual } from 'lodash';
import { Subject, Unsubscribable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  takeUntil,
  delay,
  tap,
} from 'rxjs/operators';
import { QueryParamFilterConfig } from './param.model';
import { ParamConfigService } from './paramConfigService';
import { CONTROL_TYPES, isObjectEmpty, parse } from './utils';
import { WindowService } from './window.service';
export class ParamSyncController {
  private paramConfig: ParamConfigService[] = [];
  private source: FormGroup;
  private storageName: string;
  destory$ = new Subject();
  locationPathName;
  private formDesotry$: Unsubscribable;
  constructor(
    private router: Router,
    private activedRoute: ActivatedRoute,
    private windowService: WindowService
  ) {
    this.locationPathName = this.location.pathname;
  }
  get location() {
    return this.window.location;
  }

  get localStorage() {
    return this.window.localStorage;
  }

  get window() {
    return this.windowService.windowRef;
  }
  async initilize(option: QueryParamFilterConfig) {
    for (let mata of option.config) {
      this.paramConfig.push(
        new ParamConfigService(this.activedRoute, option.source, mata)
      );
    }
    this.source = option.source;
    this.storageName = option.storageName;
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
      this.patchValue();
    } else {
      await this.initParam().then((resp) => {
        console.log('init for form value', resp);
      });
    }
    this.startListeningToFormChange();
    let shouldTrigger = false;
    this.router.events
      .pipe(
        takeUntil(this.destory$),
        filter((i) => {
          if (
            i instanceof NavigationStart &&
            i.navigationTrigger === 'popstate' &&
            i.url.includes(this.locationPathName)
          ) {
            shouldTrigger = true;
            return false;
          }
          if (i instanceof NavigationEnd && shouldTrigger) {
            shouldTrigger = false;
            return true;
          }
          return false;
        })
      )
      .subscribe(async (resp) => {
        await this.resolveTheResolver();
        this.stopToFormListening();
        this.patchValue();
        this.startListeningToFormChange();
      });
    this.activedRoute.queryParams
      .pipe(takeUntil(this.destory$))
      .subscribe(async (resp) => {
        this.saveToStorage();
      });
    return queryParamData;
  }
  stopToFormListening() {
    if (this.formDesotry$) {
      this.formDesotry$.unsubscribe();
    }
  }
  startListeningToFormChange() {
    this.formDesotry$ = this.control.valueChanges
      ?.pipe(
        takeUntil(this.destory$),
        debounceTime(500),
        distinctUntilChanged(isEqual)
      )
      .subscribe((resp) => {
        console.log('control value changes', resp);
        this.updateQueryParam();
      });
  }
  getFromStorage() {
    if (this.storageName) {
      const searchUrl = this.localStorage.getItem(this.storageName);
      if (searchUrl) {
        return searchUrl;
      }
    }
    return null;
  }
  saveToStorage() {
    const searchUrl = this.location.search;
    if (searchUrl && this.storageName) {
      this.localStorage.setItem(this.storageName, searchUrl);
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

  patchValue() {
    let result: Record<string, any> = {};
    this.paramConfig.forEach((config) => {
      result[config.queryName] = config.patch();
    });
    if (result !== null) {
      this.control?.patchValue(result, {});
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

  updateQueryParam() {
    console.log('update query param');
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