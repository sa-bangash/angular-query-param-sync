import { Directive, Input, OnDestroy, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Observable, isObservable } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip, take } from 'rxjs/operators';
import { FilterPermenentRetainDirective } from './filter-permenent-retain.directive';
@Directive({
  selector: '[appFilterRetain]',
})
export class FilterRetainDirective implements OnDestroy {
  @Input()
  defaultValue: Observable<any> | any;

  constructor(
    private ngControl: NgControl,
    private router: Router,
    private activedRoute: ActivatedRoute,
    @Optional() private filterStore: FilterPermenentRetainDirective
  ) {}
  ngOnInit() {
    this.init();
    this.ngControl.valueChanges
      ?.pipe(debounceTime(500), distinctUntilChanged(isEqual))
      .subscribe((resp) => {
        this.saveToPermanent(resp);
        this.updateQueryParam();
      });
    this.activedRoute.queryParams.pipe(skip(1)).subscribe((resp) => {
      if (resp[this.key] && !this.isQueryAndFormSync()) {
        this.patchValue(resp[this.key]);
        this.saveToPermanent(this.value);
      }
    });
  }

  async init() {
    let data = this.getQueryParamData() || this.getFromPermentStorage() || null;

    if (data !== null) {
      this.patchValue(data);
    } else {
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
        data = this.defaultValue;
      }
    }

    setTimeout(() => {
      this.updateQueryParam();
    }, 0);
    this.saveToPermanent(data);
  }
  getQueryParamData() {
    const data = this.activedRoute.snapshot.queryParams;
    if (data) {
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
    const param = this.getQueryParamData();
    return this.getQueryParamData() === this.value;
  }
  patchValue(data: any) {
    this.ngControl.control?.patchValue(data);
  }

  saveToPermanent(data: any) {
    this.filterStore?.save(this.key, data);
  }

  getFromPermentStorage() {
    return this.filterStore?.query(this.key);
  }

  get key(): string {
    if (typeof this.ngControl.name === 'string') {
      return this.ngControl.name;
    }
    return null;
  }

  get value() {
    return this.ngControl.control.value;
  }

  ngOnDestroy(): void {}
}
