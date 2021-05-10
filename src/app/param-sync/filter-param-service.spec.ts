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

fdescribe('Form => param ', () => {
  fdescribe('string', () => {
    let router: Router;
    let component: MockComonent;
    let fixture: ComponentFixture<MockComonent>;
    beforeEach(async () => {
      TestBed.configureTestingModule({
        declarations: [MockComonent],
        imports: [
          FormsModule,
          ReactiveFormsModule,
          RouterTestingModule.withRoutes([]),
        ],
      }).compileComponents();
      const x = TestBed.inject(ActivatedRoute);
      const router = TestBed.inject(Router);
      console.log('router', router);
      await router.navigate([], { queryParams: null });
      console.log('called before');
      fixture = TestBed.createComponent(MockComonent);
      component = fixture.componentInstance;
    });
    it('default value  to param', fakeAsync(async () => {
      console.log('before', component.queryParamSnapshot, component.form.value);
      await component.initQueryParam();
      console.log('after', component.form.value);
      console.log('query snapet default value', component.queryParamSnapshot);
      expect(component.queryParamSnapshot).toEqual(
        jasmine.objectContaining({
          search: 'default value',
        })
      );
      tick(600);
    }));
    // it('change string after default value', fakeAsync(async () => {
    //   await component.initQueryParam();

    //   component.searchCtrl.patchValue('new value');
    //   console.log(component.queryParamSnapshot);
    //   expect(component.queryParamSnapshot).toEqual(
    //     jasmine.objectContaining({
    //       search: 'new value',
    //     })
    //   );
    //   tick(600);
    // }));
  });
});

// describe('Param => form', () => {
//   let component: MockComonent;
//   let fixture: ComponentFixture<MockComonent>;
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       declarations: [MockComonent],
//       imports: [
//         FormsModule,
//         ReactiveFormsModule,
//         RouterTestingModule.withRoutes([]),
//       ],
//       providers: [stubActivatedRoute({ search: 'param to form' })],
//     }).compileComponents();
//     fixture = TestBed.createComponent(MockComonent);
//     component = fixture.componentInstance;
//   });
//   it('string param to form', fakeAsync(async () => {
//     console.log('mock snapshot', component.activitatedRoute);

//     await component.initQueryParam();
//     tick();
//     console.log(component.form.value);
//     expect(component.searchCtrl.value).toEqual('param to form');
//   }));
// });
