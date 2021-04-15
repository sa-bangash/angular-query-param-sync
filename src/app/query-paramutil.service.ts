import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, scan, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QueryParamutilService {
  subject = new Subject();
  queryParamState: any = {};
  constructor(private router: Router, private activedRoute: ActivatedRoute) {
    this.subject
      .pipe(
        tap((acc) => Object.assign(this.queryParamState, acc)),
        debounceTime(100)
      )
      .subscribe((resp) => {
        console.log('subject', this.queryParamState);
        this.initQueryParam(this.queryParamState);
        this.reset();
      });
  }
  reset() {
    this.queryParamState = {};
  }
  initQueryParam(data: any) {
    this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: {
        ...data,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  onPush(data: any) {
    this.subject.next(data);
  }
}
