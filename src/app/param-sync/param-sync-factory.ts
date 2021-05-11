import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParamSyncController } from './param-sync.controller';
import { QueryParamFilterConfig } from './param.model';
import { FilterStorageService } from './filter-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ParamSyncFactory {
  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    private storage: FilterStorageService
  ) {}

  async create(config: QueryParamFilterConfig): Promise<ParamSyncController> {
    const paramSyncControler = new ParamSyncController(
      this.router,
      this.activatedRouter,
      this.storage
    );
    return await paramSyncControler.initilize(config);
  }
}
