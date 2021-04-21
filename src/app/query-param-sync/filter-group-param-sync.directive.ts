import { Directive, Input, OnDestroy, Optional } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Observable, Subject } from 'rxjs';
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
@Directive({
  selector: '[filterGroupParamSync]',
})
export class FilterGroupParamSyncDirective implements OnDestroy {
  @Input('filterGroupParamSync') ctrl: AbstractControl | any;
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
    @Optional() private controlContainer: ControlContainer,
    private router: Router,
    private activedRoute: ActivatedRoute
  ) {}

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
    return this.control.value;
  }

  get control(): AbstractControl {
    if (this.ctrl) {
      return this.ctrl;
    }
    return this.controlContainer.control;
  }

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
    const queryParamData = this.getQueryParam();
    const storageData = this.getFromStorage();
    if (queryParamData) {
      this.patchValue(queryParamData);
      this.saveToStorage(queryParamData);
    } else if (storageData) {
      this.patchValue(storageData);
      this.initParam();
    }
    console.log('init finished');
    // let data = this.getQueryParam() || this.getFromStorage() || this.value || null;

    // this.saveToStorage(data || this.defaultValue);
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

  private initParam() {
    this.router.navigate([], {
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

  isQueryAndFormSync(): Boolean {
    const param = this.getQueryParam();
    return isEqual(param, this.value);
  }

  patchValue(data: any) {
    if (data !== null) {
      this.control?.patchValue(data);
    }
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

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}
