import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterParamSync } from './filter-param-sync.directive';
import { FilterParamStorage } from './filter-param-storage.directive';
import { FilterGroupParamSyncDirective } from './filter-group-param-sync.directive';
import { FilterStoreService } from './filter-store.service';
import { FilterParamService } from './filter-param.service';

@NgModule({
  exports: [FilterParamSync, FilterParamStorage, FilterGroupParamSyncDirective],
  declarations: [
    FilterParamSync,
    FilterParamStorage,
    FilterGroupParamSyncDirective,
  ],
  providers: [FilterStoreService, FilterParamService],
  imports: [CommonModule],
})
export class QueryParamSyncModule {}
