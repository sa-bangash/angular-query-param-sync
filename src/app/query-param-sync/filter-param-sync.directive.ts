import { Directive, Input, OnDestroy, Optional, Self } from '@angular/core';
import { AbstractControl, FormGroup, NgControl } from '@angular/forms';
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
import { AbstractParamSyncDirective } from './abstract-param-sync.directive';
import { QueryParamInitService } from './query-param-init.service';
interface StoreFilter {
  save(key: string, value: string): void;
  query(key: string): any;
}
@Directive({
  selector: '[filterParamSync]',
})
export class FilterParamSync
  extends AbstractParamSyncDirective
  implements OnDestroy {
  @Input('filterParamSync') ctrl: AbstractControl | any;

  /*
  defaultControlValue
  we need to find way how to take default type:
  like control is  element is array becuase we lost the 
  array when getting single data from query param
   */
  defaultControlValue: any = null;

  @Input('storageSync')
  storageSync: StoreFilter;

  constructor(
    @Optional() protected ngControl: NgControl,
    protected router: Router,
    protected activedRoute: ActivatedRoute,
    protected queryParamUtils: QueryParamInitService
  ) {
    super(ngControl, router, activedRoute, queryParamUtils);
  }
  async ngOnInit() {
    this.defaultControlValue = this.value;
    super.ngOnInit();
  }

  patchValue(data: any) {
    if (Array.isArray(this.defaultControlValue)) {
      data = Array.isArray(data)
        ? data
        : [undefined, 'undefined'].includes(data)
        ? []
        : [data];
    }
    super.patchValue(data);
  }
  get key(): string {
    if (this.queryParamName) {
      return this.queryParamName;
    }
    if (typeof this.ngControl.name === 'string') {
      return this.ngControl.name;
    }
    return null;
  }
}
