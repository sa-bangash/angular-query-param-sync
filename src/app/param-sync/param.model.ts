import { FormGroup } from '@angular/forms';
import { CONTROL_TYPES } from './utils';

export interface QueryParamFilterConfig {
  source: FormGroup;
  config: Config[];
  storageName?: string;
  replaceUrl?: boolean;
}
export type ResolverType = (value: any) => Promise<any>;
export interface Config {
  type?: CONTROL_TYPES;
  path?: string;
  queryName: string;
  serializer?: (value: any) => any;
  parser?: (value: any) => any;
  patch?: (value: any) => any;
  resolver?: ResolverType;
  resolveData?: any;
}

export interface FilterSyncStorage {
  saveItem: (path: string, data: any) => void;
  getItem: (path: string) => any;
  removeItem: (path: string) => void;
}
