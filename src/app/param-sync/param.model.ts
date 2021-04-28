import { FormGroup } from '@angular/forms';
import { CONTROL_TYPES } from './utils';

export interface QueryParamFilterConfig {
  source: FormGroup;
  config: Config[];
  storageName?: string;
}
export type ResolverType = (value: any) => Promise<any>;
export interface Config {
  type?: CONTROL_TYPES;
  queryName: string;
  serializer?: (value: any) => any;
  parser?: (value: any) => any;
  patch?: (value: any) => any;
  resolver?: ResolverType;
  resolveData?: any;
}
