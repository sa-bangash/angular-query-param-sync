import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';

import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
import { ParamSyncController } from 'src/app/param-sync/param-sync.controller';
import { FilterStoreService } from 'src/app/query-param-sync/filter-store.service';
import { CONTROL_TYPES } from 'src/app/param-sync/utils';
import { ParamSyncFactory } from 'src/app/param-sync/param-sync-factory';
import { RouterTestingModule } from '@angular/router/testing';
import { Mock } from 'protractor/built/driverProviders';

@Component({
  template: '',
})
class MockComonent {
  form: FormGroup;
  paramSync: ParamSyncController;
  constructor(
    private fb: FormBuilder,
    public queryParamSyncFactory: ParamSyncFactory,
    public activitatedRoute: ActivatedRoute
  ) {
    this.form = this.fb.group({
      search: ['some data'],
    });
  }

  async initQueryParam() {
    return this.queryParamSyncFactory
      .create({
        source: this.form,
        storageName: 'Student',
        mataData: [
          {
            queryName: 'search',
            type: CONTROL_TYPES.STRING,
          },
        ],
      })
      .then((instance) => {
        this.paramSync = instance;
        return instance.resolveTheResolver().then(() => instance);
      })
      .then((instance) => {
        instance.sync();
      });
  }
  get queryParamSnapshot() {
    return this.activitatedRoute.snapshot.queryParams;
  }
  ngOnDestroy(): void {
    this.paramSync.destory();
  }
}

fdescribe('Param sync ', () => {
  let router: Router;
  let component: MockComonent;
  let fixture: ComponentFixture<MockComonent>;
  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MockComonent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
      ],
    });
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(MockComonent);
    component = fixture.componentInstance;
  }));
  it('string', async () => {
    await component.initQueryParam();
    console.log(component.queryParamSnapshot);
    expect(component.queryParamSnapshot).toEqual(
      jasmine.objectContaining({
        search: 'some data',
      })
    );
  });
});
