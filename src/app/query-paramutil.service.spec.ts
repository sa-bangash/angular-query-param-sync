import { TestBed } from '@angular/core/testing';

import { QueryParamInitService } from './query-param-init.service';

describe('QueryParamutilService', () => {
  let service: QueryParamInitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryParamInitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
