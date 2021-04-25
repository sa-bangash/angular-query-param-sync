import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
import { FilterParamService } from 'src/app/query-param-sync/filter-param.service';
import { FilterStoreService } from 'src/app/query-param-sync/filter-store.service';
import { CONTROL_TYPES } from 'src/app/query-param-sync/utils';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
  // providers: [FilterParamService],
})
export class StudentComponent implements OnInit, OnDestroy {
  form: FormGroup;
  filterParamService: FilterParamService;
  users = [
    {
      id: 1,
      name: 'shahid1',
      topic: {
        id: 62,
        name: 'some Topic',
      },
    },
    {
      id: 2,
      name: 'shahid2',
      topic: {
        id: 22,
        name: 'some Topic',
      },
    },
    {
      id: 3,
      name: 'shahid3',
      topic: {
        id: 32,
        name: 'some Topic',
      },
    },
  ];
  constructor(
    private fb: FormBuilder,
    public filterStoreService: FilterStoreService,
    public router: Router,
    public activeRouter: ActivatedRoute
  ) {
    this.form = this.fb.group({
      booksName: [],
      search: [],
      date: [],
      user: [this.users[0]],
    });

    this.filterParamService = new FilterParamService(
      this.router,
      this.activeRouter
    );

    this.filterStoreService.setFeatureKey('Students');
    this.filterParamService.connect({
      source: this.form,
      storageName: 'Student',
      mataData: [
        {
          type: CONTROL_TYPES.INT_ARRAY,
          queryName: 'booksName',
        },
        {
          queryName: 'search',
          type: CONTROL_TYPES.STRING,
        },
        {
          queryName: 'date',
        },
        {
          queryName: 'user',
          type: CONTROL_TYPES.OBJECT,
          patch: (value) => {
            console.log('-----value in patch', value);
            const findUser = this.users.find((user) => user.id === value);
            console.log('finduser', findUser);
            return findUser;
          },
          compareWith: (param, form) => param === form.id,
          parser: (value: string) => {
            // const valuesArray = value.split(',');
            // const result = {
            //   id: +valuesArray[0],
            //   name: valuesArray[1],
            // };
            return +value;
          },
          serializer: (value) => {
            // if (value) {
            //   return `${value.id},${value.name}`;
            // }
            return value.id;
          },
        },
      ],
    });
    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(isEqual))
      .subscribe((resp) => {
        console.log('book backend called', this.form.value);
      });
  }
  ngOnDestroy(): void {
    console.log('destory caled');
    this.filterParamService.destory();
  }
  compareFn(a: any, b: any) {
    return a.id === b.id;
  }
  ngOnInit(): void {}
}
