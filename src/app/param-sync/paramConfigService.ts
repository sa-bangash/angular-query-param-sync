import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { isEqual } from 'lodash';
import { Config, ResolverType } from './param.model';
import { CONTROL_TYPES, parse } from './utils';

export class ParamConfigService {
  private _resolveData?: any;
  constructor(
    private activateRoute: ActivatedRoute,
    private form: FormGroup,
    private config: Config
  ) {}
  get path(): string {
    return this.config.path;
  }
  get type(): CONTROL_TYPES {
    return this.config.type;
  }
  get queryName(): string {
    return this.config.queryName;
  }

  get formKey(): string {
    return this.path || this.queryName;
  }
  get serializerFn(): Function {
    return this.config.serializer;
  }
  get formValue() {
    return this.form.get(this.formKey).value;
  }
  serialized() {
    const paramValue = this.formValue;
    const serilizedValue = this.serializerFn?.(paramValue) || paramValue;
    if (Array.isArray(serilizedValue) && !serilizedValue.length) {
      return null;
    }
    return serilizedValue || null;
  }
  get parserFn(): Function {
    return this.config.parser;
  }

  parse(): any {
    if (this.parserFn) {
      return this.parserFn(this.queryData);
    } else {
      if (this.type) {
        return parse(this.queryData, this.type);
      }
      return this.queryData;
    }
  }

  get patchFn(): Function {
    return this.config.patch;
  }
  patch() {
    if (this.patchFn instanceof Function) {
      return this.patchFn(this.resolveData || this.queryData);
    } else if (this.parserFn) {
      return this.resolveData || this.parserFn(this.queryData);
    }
    return this.resolveData || parse(this.queryData, this.type);
  }
  get resolverFn(): ResolverType {
    return this.config.resolver;
  }
  resolver(): Promise<any> {
    return this.resolverFn(this.queryData).then((resp) => {
      this.resolveData = resp;
      return resp;
    });
  }

  get queryData(): any {
    return this.activateRoute.snapshot.queryParams[this.queryName];
  }
  set resolveData(v: any) {
    this._resolveData = v;
  }
  get resolveData() {
    return this._resolveData;
  }
}
