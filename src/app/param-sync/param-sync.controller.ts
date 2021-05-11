import { AbstractControl, FormGroup } from '@angular/forms';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { isEqual } from 'lodash';
import { BehaviorSubject, Unsubscribable } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  takeUntil,
} from 'rxjs/operators';
import { FilterSyncStorage, QueryParamFilterConfig } from './param.model';
import { ParamConfigService } from './paramConfigService';
import { isObjectEmpty } from './utils';
export class ParamSyncController {
  private paramConfig: ParamConfigService[] = [];
  private source: FormGroup;
  private storageName: string;
  destory$ = new BehaviorSubject<boolean>(false);
  replaceUrl = false;

  private formDesotry$: Unsubscribable;
  constructor(
    private router: Router,
    private activedRoute: ActivatedRoute,
    private storage: FilterSyncStorage
  ) {}

  async initilize(option: QueryParamFilterConfig) {
    for (const mata of option.config) {
      this.paramConfig.push(
        new ParamConfigService(this.activedRoute, option.source, mata)
      );
    }
    this.source = option.source;
    this.storageName = option.storageName;
    this.replaceUrl = !!option.replaceUrl;
    await this.initUrlFromStorage();
    return this;
  }

  async resolveTheResolver(): Promise<any> {
    return Promise.all(
      this.paramConfig
        .filter((mata) => mata.resolverFn)
        .map((mata) => mata.resolver())
    );
  }

  async initUrlFromStorage() {
    const queryParamData = this.getQueryParam();
    if (isObjectEmpty(queryParamData)) {
      const storageParam = this.getFromStorage();
      if (storageParam) {
        await this.initParam(storageParam);
      }
    }
  }
  async sync() {
    if (this.destory$.value) {
      return null;
    }
    const queryParamData = this.getQueryParam();
    if (!isObjectEmpty(queryParamData)) {
      this.patchValue();
    } else {
      await this.initParam();
    }
    this.startListeningToFormChange();
    let shouldTrigger = false;
    this.router.events
      .pipe(
        takeUntil(this.destory$.pipe(filter((v: boolean) => v))),
        filter((i) => {
          if (
            i instanceof NavigationStart &&
            i.navigationTrigger === 'popstate'
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
      .pipe(takeUntil(this.destory$.pipe(filter((v: boolean) => v))))
      .subscribe(() => {
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
        takeUntil(this.destory$.pipe(filter((v: boolean) => v))),
        debounceTime(500),
        distinctUntilChanged(isEqual)
      )
      .subscribe((resp) => {
        this.updateQueryParam();
      });
  }

  getFromStorage() {
    try {
      if (this.storageName) {
        const data = this.storage.getItem(this.storageName);
        if (data) {
          return data;
        }
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  getDataForStorage(): any {
    const result: Record<string, any> = {};
    for (const mata of this.paramConfig) {
      result[mata.queryName] = mata.queryData;
    }
    return result;
  }
  saveToStorage() {
    const dataToStore = this.getDataForStorage();
    if (this.storageName) {
      if (!isObjectEmpty(dataToStore)) {
        this.storage.saveItem(this.storageName, dataToStore);
      } else {
        this.storage.removeItem(this.storageName);
      }
    }
  }
  private initParam(data?: any) {
    if (this.destory$.value) {
      return null;
    }
    const paramData = data || this.serilizeParam();
    return this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: paramData,
      replaceUrl: true,
    });
  }

  serilizeParam(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const mata of this.paramConfig) {
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
    const result: Record<string, any> = {};
    this.paramConfig.forEach((config) => {
      result[config.formKey] = config.patch();
    });
    if (result !== null) {
      this.control?.patchValue(result);
    } else {
      this.control.reset();
    }
  }

  getQueryParam() {
    const data = this.activedRoute.snapshot.queryParams;
    if (Object.keys(data).length) {
      const parseData: Record<string, any> = {};

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
    this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: {
        ...this.serilizeParam(),
      },
      queryParamsHandling: 'merge',
      replaceUrl: this.replaceUrl,
    });
  }

  destory() {
    this.destory$.next(true);
    this.destory$.complete();
  }
}
