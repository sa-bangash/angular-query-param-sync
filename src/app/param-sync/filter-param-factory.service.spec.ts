import { TestBed } from '@angular/core/testing';

import { ParamSyncFactory } from './param-sync-factory';

describe('FilterParamFactoryService', () => {
  let service: ParamSyncFactory;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParamSyncFactory);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
