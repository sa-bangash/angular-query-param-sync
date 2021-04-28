import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isEqual } from 'lodash';
import { debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
import { ParamSyncController } from 'src/app/param-sync/param-sync.controller';
import { CONTROL_TYPES } from 'src/app/param-sync/utils';
import { ParamSyncFactory } from 'src/app/param-sync/param-sync-factory';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
})
export class StudentComponent implements OnInit, OnDestroy {
  form: FormGroup;
  queryParamFilter: ParamSyncController;
  users: any = [];
  selectedUser: any;
  constructor(
    private fb: FormBuilder,
    public queryParamSyncFactory: ParamSyncFactory
  ) {
    this.form = this.fb.group({
      booksName: [],
      search: [],
      date: [],
      user: [],
      aggree: [],
    });
    this.initQueryParam();
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
  initQueryParam() {
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
            type: CONTROL_TYPES.BOOLEAN,
            queryName: 'aggree',
          },
          {
            queryName: 'search',
            type: CONTROL_TYPES.STRING,
          },
          {
            queryName: 'date',
            parser: (value) => {
              console.log('parser', value);
              if (value) {
                return value.split('/').join('-');
              }
              return value;
            },
            serializer: (value: string) => {
              console.log('sernlize date', value);
              if (value) {
                return value.split('-').join('/');
              }
              return value;
            },
          },
          {
            queryName: 'user',
            type: CONTROL_TYPES.OBJECT,
            resolver: async (val) => {
              console.log('resolver called with ', val);
              if (val) {
                return fetchUsers(+val).then((resp) => {
                  return resp;
                });
              }
              return null;
            },
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
        instance.sync();
      });
  }
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
    }, 500);
  });
}
