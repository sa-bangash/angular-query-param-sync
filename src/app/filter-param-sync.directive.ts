import { Directive, Input, OnDestroy, Optional, Self } from '@angular/core';
import { AbstractControl, NgControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Observable, isObservable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  skip,
  take,
  takeUntil,
  filter,
} from 'rxjs/operators';
import { QueryParamutilService } from './query-paramutil.service';
interface StoreFilter {
  save(key: string, value: string): void;
  query(key: string): any;
}
@Directive({
  selector: '[filterParamSync]',
})
export class FilterParamSync implements OnDestroy {
  @Input('filterParamSync') ctrl: AbstractControl | undefined;

  @Input()
  defaultValue: Observable<any> | any;

  @Input()
  storageSync: StoreFilter;

  @Input()
  name: string;
  destory$ = new Subject();

  defaultControlValue: any = null;
  constructor(
    private ngControl: NgControl,
    private router: Router,
    private activedRoute: ActivatedRoute,
    private queryParamUtils: QueryParamutilService
  ) {}
  ngOnInit() {
    this.defaultControlValue = this.value;
    console.log(this.key, this.control.value);
    this.init();
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
        // skip(1),
        takeUntil(this.destory$),
        filter(() => !this.isQueryAndFormSync())
      )
      .subscribe((resp) => {
        console.log(this.key, 'first on first time');
        this.patchValue(resp[this.key]);
        this.saveToStorage(this.value);
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

    this.queryParamUtils.onPush({
      [this.key]: this.value,
    });

    this.saveToStorage(data || this.defaultValue);
  }
  getQueryParam() {
    const data = this.activedRoute.snapshot.queryParams;
    if (data && data[this.key]) {
      return data[this.key];
    }
    return null;
  }
  updateQueryParam() {
    if (this.isQueryAndFormSync()) {
      return;
    }
    this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: {
        [this.key]: this.value,
      },
      queryParamsHandling: 'merge',
    });
  }

  isQueryAndFormSync(): Boolean {
    const param = this.getQueryParam();
    return isEqual(param, this.value);
  }

  patchValue(data: any) {
    if (Array.isArray(this.defaultControlValue)) {
      data = Array.isArray(data)
        ? data
        : [undefined, 'undefined'].includes(data)
        ? []
        : [data];
    }
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
    if (typeof this.ngControl.name === 'string') {
      return this.ngControl.name;
    }
    if (this.name) {
      return this.name;
    }
    return null;
  }

  get value() {
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
