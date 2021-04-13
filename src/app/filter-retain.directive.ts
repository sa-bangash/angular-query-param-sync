import { Directive, Input, OnDestroy } from '@angular/core';
import { NgControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Observable, isObservable } from 'rxjs';
import { debounceTime, distinctUntilChanged, skip, take } from 'rxjs/operators';
@Directive({
  selector: '[appFilterRetain]',
})
export class FilterRetainDirective implements OnDestroy {
  @Input()
  featureKey: string = null;
  @Input()
  defaultValue: Observable<any> | any;
  constructor(
    private ngControl: NgControl,
    private router: Router,
    private activedRoute: ActivatedRoute
  ) {}
  ngOnInit() {
    console.log('---onInit---', this.key);
    const data = this.getQueryParamData() || this.getData();
    if (data !== null) {
      this.patchValue(data);
    } else {
      if (isObservable(this.defaultValue)) {
        this.defaultValue.pipe(take(1)).subscribe((resp) => {
          this.patchValue(resp);
        });
      } else {
        this.patchValue(this.defaultValue);
      }
    }
    setTimeout(() => {
      this.updateQueryParam();
    }, 0);
    this.ngControl.valueChanges
      ?.pipe(debounceTime(500), distinctUntilChanged(isEqual))
      .subscribe((resp) => {
        this.storeData();
        this.updateQueryParam();
      });
    this.activedRoute.queryParams.pipe(skip(1)).subscribe((resp) => {
      if (resp[this.key] && resp[this.key] !== this.value) {
        this.patchValue(resp[this.key]);
      }
    });
  }

  getQueryParamData() {
    const data = this.activedRoute.snapshot.queryParams;
    if (data) {
      return data[this.key];
    }
    return null;
  }
  updateQueryParam() {
    this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: {
        [this.key]: this.value,
      },
      queryParamsHandling: 'merge',
    });
  }
  patchValue(data: any) {
    this.ngControl.control?.patchValue(data);
  }
  get storeKey(): string {
    if (this.featureKey && typeof this.ngControl.name === 'string') {
      return `${this.featureKey}_${this.ngControl.name}`;
    }
    if (typeof this.ngControl.name === 'string') {
      return this.ngControl.name;
    }
    return null;
  }
  get key() {
    if (typeof this.ngControl.name === 'string') {
      return this.ngControl.name;
    }
    return null;
  }

  get value() {
    return this.ngControl.control.value;
  }
  storeData() {
    if (typeof this.ngControl.name === 'string') {
      localStorage.setItem(this.storeKey, this.value);
    }
  }
  getData() {
    if (typeof this.ngControl.name === 'string') {
      return localStorage.getItem(this.storeKey);
    }
    return null;
  }
  ngOnDestroy(): void {}
}
