import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { debounceTime, scan, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QueryParamutilService {
  subject = new Subject();
  private resetParam$ = new Subject<void>();
  private queryParamState: any = {};
  constructor(private router: Router, private activedRoute: ActivatedRoute) {
    this.resetParam$.subscribe((resp) => {
      this.reset();
    });
    this.subject
      .pipe(
        tap((acc) => Object.assign(this.queryParamState, acc)),
        debounceTime(100)
      )
      .subscribe(() => {
        this.updateParam(this.queryParamState);
        this.resetParam$.next();
      });
  }
  private reset() {
    this.queryParamState = {};
  }
  private updateParam(data: any) {
    this.router.navigate([], {
      relativeTo: this.activedRoute,
      queryParams: {
        ...data,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  init(data: any): Promise<void> {
    this.subject.next(data);
    return this.resetParam$.asObservable().pipe(take(1)).toPromise();
  }
}
