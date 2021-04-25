import { FormGroup } from '@angular/forms';
import { CONTROL_TYPES } from './utils';

export interface QueryParamFilterConfig {
  source: FormGroup;
  mataData: MataData[];
  storageName?: string;
}
export interface MataData {
  type?: CONTROL_TYPES;
  queryName: string;
  serializer?: (value: any) => any;
  parser?: (value: any) => any;
  compareWith?: (param: any, form: any) => boolean;
  patch?: (value: any) => any;
}
