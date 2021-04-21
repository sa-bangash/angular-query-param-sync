import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryParamSyncModule } from '../query-param-sync/query-param-sync.module';

@NgModule({
  declarations: [],
  exports: [QueryParamSyncModule],
  imports: [CommonModule, QueryParamSyncModule],
})
export class ShareModule {}
