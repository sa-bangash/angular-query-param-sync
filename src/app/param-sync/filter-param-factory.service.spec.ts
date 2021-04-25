import { TestBed } from '@angular/core/testing';

import { FilterParamFactoryService } from './filter-param-factory.service';

describe('FilterParamFactoryService', () => {
  let service: FilterParamFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterParamFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
