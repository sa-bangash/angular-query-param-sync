import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterParamService } from './filter-param.service';
import { QueryParamFilterConfig } from './param.model';

@Injectable({
  providedIn: 'root',
})
export class FilterParamFactoryService {
  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute
  ) {}

  create(config: QueryParamFilterConfig): FilterParamService {
    return new FilterParamService(this.router, this.activatedRouter, config);
  }
}
