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

  async create(config: QueryParamFilterConfig): Promise<FilterParamService> {
    const filterService = new FilterParamService(
      this.router,
      this.activatedRouter
    );
    return await filterService.initilize(config);
  }
}
