import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { isEqual } from 'lodash';
import { MataData, ResolverType } from './param.model';
import { CONTROL_TYPES, parse } from './utils';

export class ParamConfigService {
  private _resolveData?: any;
  constructor(
    private activateRoute: ActivatedRoute,
    private form: FormGroup,
    private config: MataData
  ) {}
  get type(): CONTROL_TYPES {
    return this.config.type;
  }
  get queryName(): string {
    return this.config.queryName;
  }

  get serializerFn(): Function {
    return this.config.serializer;
  }
  get formValue() {
    return this.form.get(this.queryName).value;
  }
  serialized() {
    const paramValue = this.formValue;
    const serilizedValue = this.serializerFn?.(paramValue) || paramValue;
    return serilizedValue || null;
  }
  get parserFn(): Function {
    return this.config.parser;
  }

  parse(): any {
    if (this.parserFn) {
      return this.parserFn(this.queryData);
    } else {
      if (this.queryData && this.type) {
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
