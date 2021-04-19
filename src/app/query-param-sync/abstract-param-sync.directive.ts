import { Directive, Input, OnDestroy, Optional, Self } from '@angular/core';
import {
  AbstractControl,
  AbstractControlDirective,
  FormGroup,
  NgControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { protractor } from 'protractor/built/ptor';
import { Observable, isObservable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  skip,
  take,
  takeUntil,
  filter,
} from 'rxjs/operators';
import { QueryParamInitService } from './query-param-init.service';
interface StoreFilter {
  save(key: string, value: string): void;
  query(key: string): any;
}
@Directive({})
export abstract class AbstractParamSyncDirective implements OnDestroy {
  ctrl: AbstractControl | any;

  @Input()
  defaultValue: Observable<any> | any;

  @Input()
  storageSync: StoreFilter;

  @Input()
  queryParamName: string;

  @Input()
  queryParamTo: (value: any) => any;

  @Input()
  queryParamFrom: (value: any) => any;
  destory$ = new Subject();
  constructor(
    protected ngControl: AbstractControlDirective,
    protected router: Router,
    protected activedRoute: ActivatedRoute,
    protected queryParamUtils: QueryParamInitService
  ) {}
  async ngOnInit() {
    await this.init();
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
        const data = this.getQueryParam();
        this.patchValue(data);
        this.saveToStorage(data);
      });
  }

  async init() {
    let data =
      this.getQueryParam() || this.getFromStorage() || this.value || null;
    if (this.defaultValue && (!data || (Array.isArray(data) && !data.length))) {
      if (isObservable(this.defaultValue)) {
        data = await this.defaultValue
          .pipe(take(1))
          .toPromise()
          .then((resp) => {
            this.patchValue(resp);
            return resp;
          });
      } else {
        this.patchValue(this.defaultValue);
      }
    } else if (data) {
      this.patchValue(data);
    }

    await this.queryParamUtils.init({
      [this.key]: this.getDataForQueryParam(),
    });

    this.saveToStorage(data || this.defaultValue);
  }

  getQueryParam() {
    const data = this.activedRoute.snapshot.queryParams;
    if (data && data[this.key]) {
      if (typeof this.queryParamFrom === 'function') {
        return this.queryParamFrom(data[this.key]);
      }
      return data[this.key];
    }
    return null;
  }
  getDataForQueryParam() {
    let value = this.value;
    if (typeof this.queryParamTo === 'function') {
      value = this.queryParamTo(this.value);
    }
    return value;
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

  isQueryAndFormSync(): Boolean {
    const param = this.getQueryParam();
    return isEqual(param, this.value);
  }

  patchValue(data: any) {
    this.control?.patchValue(data);
  }

  saveToStorage(data: any) {
    if (data === null) {
      data = '';
    }
    this.storageSync?.save(this.key, data);
  }

  getFromStorage() {
    return this.storageSync?.query(this.key);
  }

  get key(): string {
    if (this.queryParamName) {
      return this.queryParamName;
    }
    return null;
  }

  get value() {
    if (this.ctrl) {
      return this.ctrl.value;
    }
    return this.ngControl.control.value;
  }

  get control(): AbstractControl {
    if (this.ctrl) {
      return this.ctrl;
    }
    return this.ngControl.control;
  }

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}
