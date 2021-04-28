import { Inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParamSyncController } from './param-sync.controller';
import { WindowService, WINDOW_SERVICE } from './window.service';
import { QueryParamFilterConfig } from './param.model';

@Injectable({
  providedIn: 'root',
})
export class ParamSyncFactory {
  constructor(
    private router: Router,
    private activatedRouter: ActivatedRoute,
    @Inject(WINDOW_SERVICE) private windowService: WindowService
  ) {}

  async create(config: QueryParamFilterConfig): Promise<ParamSyncController> {
    const paramSyncControler = new ParamSyncController(
      this.router,
      this.activatedRouter,
      this.windowService
    );
    return await paramSyncControler.initilize(config);
  }
}
