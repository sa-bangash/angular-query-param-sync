import { Component } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ParamSyncController } from 'src/app/param-sync/param-sync.controller';
import { CONTROL_TYPES } from 'src/app/param-sync/utils';
import { ParamSyncFactory } from 'src/app/param-sync/param-sync-factory';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
// this.activedRoute.snapshot.queryParams

function stubActivatedRoute(object: Record<string, any>) {
  return {
    provide: ActivatedRoute,
    useValue: {
      queryParams: of(object),
      snapshot: {
        queryParams: object,
      },
    },
  };
}
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
  get searchCtrl(): FormControl {
    return this.form.get('search') as FormControl;
  }
  ngOnDestroy(): void {
    this.paramSync.destory();
  }
}

describe('Form => param ', () => {
  let router: Router;
  let component: MockComonent;
  let fixture: ComponentFixture<MockComonent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockComonent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
  });
  describe('string', () => {
    beforeEach(() => {
      console.log('called before');
      fixture = TestBed.createComponent(MockComonent);
      component = fixture.componentInstance;
    });
    it('default value  to param', async () => {
      await component.initQueryParam();
      console.log(component.queryParamSnapshot);
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
      console.log(component.queryParamSnapshot);
      expect(component.queryParamSnapshot).toEqual(
        jasmine.objectContaining({
          search: 'new value',
        })
      );
    }));
  });
});

describe('Param => form', () => {
  let component: MockComonent;
  let fixture: ComponentFixture<MockComonent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MockComonent],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [stubActivatedRoute({ search: 'param to form' })],
    }).compileComponents();
    fixture = TestBed.createComponent(MockComonent);
    component = fixture.componentInstance;
  });
  it('string param to form', fakeAsync(async () => {
    console.log('mock snapshot', component.activitatedRoute);

    await component.initQueryParam();
    tick();
    console.log(component.form.value);
    expect(component.searchCtrl.value).toEqual('param to form');
  }));
});
