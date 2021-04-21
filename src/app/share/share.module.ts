import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryParamSyncModule } from '../query-param-sync/query-param-sync.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [],
  exports: [QueryParamSyncModule, FormsModule, ReactiveFormsModule],
  imports: [
    CommonModule,
    QueryParamSyncModule,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class ShareModule {}
