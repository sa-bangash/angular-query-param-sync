import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterParamSync } from './filter-param-sync.directive';
import { FilterParamStorage } from './filter-param-storage.directive';
import { FilterGroupParamSyncDirective } from './filter-group-param-sync.directive';
import { FilterStoreService } from './filter-store.service';

@NgModule({
  exports: [FilterParamSync, FilterParamStorage, FilterGroupParamSyncDirective],
  declarations: [
    FilterParamSync,
    FilterParamStorage,
    FilterGroupParamSyncDirective,
  ],
  providers: [FilterStoreService],
  imports: [CommonModule],
})
export class QueryParamSyncModule {}
