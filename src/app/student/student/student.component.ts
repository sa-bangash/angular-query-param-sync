import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
import { FilterParamService } from 'src/app/param-sync/filter-param.service';
import { FilterStoreService } from 'src/app/query-param-sync/filter-store.service';
import { CONTROL_TYPES } from 'src/app/param-sync/utils';
import { FilterParamFactoryService } from 'src/app/param-sync/filter-param-factory.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
  // providers: [FilterParamService],
})
export class StudentComponent implements OnInit, OnDestroy {
  form: FormGroup;
  queryParamFilter: FilterParamService;
  users: any = [];
  selectedUser: any;
  constructor(
    private fb: FormBuilder,
    public queryParamSyncFactory: FilterParamFactoryService
  ) {
    this.form = this.fb.group({
      booksName: [],
      search: [],
      date: [],
      user: [],
    });

    this.queryParamSyncFactory
      .create({
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
            resolver: async (val) => {
              console.log('called resolver', val);
              if (val) {
                return fetchUsers(val).then((resp) => {
                  console.log('user fetch', resp);
                  return resp;
                });
              }
              return null;
            },
            compareWith: (param, form) => param === form?.id,
            parser: (value: string) => {
              return +value;
            },
            serializer: (value) => {
              if (value) {
                return value.id;
              }
            },
          },
        ],
      })
      .then((instance) => {
        this.queryParamFilter = instance;
        return instance.resolveTheResolver().then(() => instance);
      })
      .then((instance) => {
        console.log(instance);
        instance.sync();
      });

    fetchUsers().then((users) => {
      console.log('esolv', users);
      this.users = users;
      console.log('sync called');
    });
    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(isEqual))
      .subscribe((resp) => {
        console.log('backend called', resp);
      });
  }

  ngOnDestroy(): void {
    console.log('destory caled');
    this.queryParamFilter.destory();
  }
  compareFn(a: any, b: any) {
    if (a && b) {
      return a.id === b.id;
    }
    return false;
  }
  ngOnInit(): void {}
}

function fetchUsers(id?: number): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = [
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
      ].filter((i) => {
        if (!id) {
          return true;
        }
        return id === i.id;
      });
      if (id) {
        resolve(result[0]);
      } else {
        resolve(result);
      }
    }, 1000);
  });
}
