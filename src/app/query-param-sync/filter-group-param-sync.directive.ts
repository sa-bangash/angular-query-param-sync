import { Directive, Input, OnDestroy, Optional } from '@angular/core';
import { AbstractControl, ControlContainer, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractParamSyncDirective } from './abstract-param-sync.directive';
import { QueryParamInitService } from './query-param-init.service';
interface StoreFilter {
  save(key: string, value: string): void;
  query(key: string): any;
}
@Directive({
  selector: '[filterGroupParamSync]',
})
export class FilterGroupParamSyncDirective
  extends AbstractParamSyncDirective
  implements OnDestroy {
  @Input('filterGroupParamSync') ctrl: AbstractControl | any;

  constructor(
    @Optional() protected controlContainer: ControlContainer,
    protected router: Router,
    protected activedRoute: ActivatedRoute,
    protected queryParamUtils: QueryParamInitService
  ) {
    super(controlContainer, router, activedRoute, queryParamUtils);
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
}
