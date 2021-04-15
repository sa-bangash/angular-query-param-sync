import { TestBed } from '@angular/core/testing';

import { QueryParamutilService } from './query-paramutil.service';

describe('QueryParamutilService', () => {
  let service: QueryParamutilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryParamutilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
