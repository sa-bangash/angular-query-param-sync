import { Directive, Input, OnDestroy, Optional } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroup } from '@angular/forms';
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
import { QueryParamInitService } from './query-param-init.service';
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
  destory$ = new Subject();

  @Input()
  queryParamTo: (value: any) => any;

  @Input()
  queryParamFrom: (value: any) => any;
  constructor(
    @Optional() private controlContainer: ControlContainer,
    private router: Router,
    private activedRoute: ActivatedRoute,
    private queryParamUtils: QueryParamInitService
  ) {}
  get key(): string {
    if (this.queryParamName) {
      return this.queryParamName;
    }
    if (typeof this.controlContainer.name === 'string') {
      return this.controlContainer.name;
    }
    return null;
  }

  get value() {
    if (this.ctrl) {
      return this.ctrl.value;
    }
    return this.controlContainer.control.value;
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
      } else if (this.control instanceof FormGroup) {
        return JSON.parse(data[this.key]);
      }
      return data[this.key];
    }
    return null;
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

  ngOnDestroy(): void {
    this.destory$.next();
    this.destory$.complete();
  }
}
