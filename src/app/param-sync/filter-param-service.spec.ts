import { Component, OnDestroy } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ParamSyncController } from './param-sync.controller';
import { CONTROL_TYPES } from './utils';
import { ParamSyncFactory } from './param-sync-factory';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

const stubActivatedRoute = (object: Record<string, any>) => ({
    provide: ActivatedRoute,
    useValue: {
      queryParams: of(object),
      snapshot: {
        queryParams: object,
      },
    },
  });
@Component({
  template: '',
})
class MockComponent implements OnDestroy {
  form: FormGroup;
  paramSync: ParamSyncController;
  constructor(
    private fb: FormBuilder,
    public queryParamSyncFactory: ParamSyncFactory,
    public activitatedRoute: ActivatedRoute
  ) {
    this.form = this.fb.group({
      search: ['default value'],
      users: [[]],
      agree: false,
    });
  }

  async initQueryParam() {
    return this.queryParamSyncFactory
      .create({
        source: this.form,
        storageName: 'Student',
        config: [
          {
            queryName: 'search',
            type: CONTROL_TYPES.STRING,
          },
        ],
      })
      .then(instance => {
        this.paramSync = instance;
        return instance.resolveTheResolver().then(() => instance);
      })
      .then(instance => {
        instance.sync();
      });
  }
  get queryParamSnapshot() {
    return this.activitatedRoute.snapshot.queryParams;
  }
  get searchCtrl(): FormControl {
    return this.form.get('search') as FormControl;
  }
  ngOnDestroy(): void {
    this.paramSync.destory();
  }
}

describe('Form => param ', () => {
  let router: Router;
  let component: MockComponent;
  let fixture: ComponentFixture<MockComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockComponent],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
    }).compileComponents();
    router = TestBed.inject(Router);
  });
  describe('string', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(MockComponent);
      component = fixture.componentInstance;
    });
    it('default value  to param', async () => {
      await component.initQueryParam();
      expect(component.queryParamSnapshot).toEqual(
        jasmine.objectContaining({
          search: 'default value',
        })
      );
    });
    it('change string after default value', fakeAsync(() => {
      component.initQueryParam();
      tick();
      component.searchCtrl.patchValue('new value');
      tick(500);
      expect(component.queryParamSnapshot).toEqual(
        jasmine.objectContaining({
          search: 'new value',
        })
      );
    }));
  });
});

describe('Param => form', () => {
  let component: MockComponent;
  let fixture: ComponentFixture<MockComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockComponent],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      providers: [stubActivatedRoute({ search: 'param to form' })],
    }).compileComponents();
    fixture = TestBed.createComponent(MockComponent);
    component = fixture.componentInstance;
  });
  it('string param to form', fakeAsync(async () => {
    await component.initQueryParam();
    tick();
    expect(component.searchCtrl.value).toEqual('param to form');
  }));
});
