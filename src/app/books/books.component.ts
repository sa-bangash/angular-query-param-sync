import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
import { FilterParamFactoryService } from '../param-sync/filter-param-factory.service';
import { FilterParamService } from '../param-sync/filter-param.service';
import { CONTROL_TYPES } from '../param-sync/utils';
import { FilterStoreService } from '../query-param-sync/filter-store.service';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.css'],
})
export class BooksComponent implements OnInit {
  form: FormGroup;
  location$ = new Observable((obser) => {
    obser.next(4);
  }).pipe(delay(2000));
  queryParamFilter: FilterParamService;
  constructor(
    private fb: FormBuilder,
    public queryParamSyncFactory: FilterParamFactoryService
  ) {
    this.form = this.fb.group({
      booksName: [[]],
      search: 'default from form',
      date: [],
    });
    this.initQueryParam();
    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(isEqual))
      .subscribe((resp) => {
        console.log('book backend called', this.form.value);
      });
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.queryParamFilter.destory();
  }
  initQueryParam() {
    this.queryParamSyncFactory
      .create({
        source: this.form,
        storageName: 'Book',
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
        ],
      })
      .then((instance) => {
        this.queryParamFilter = instance;
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
    }, 1000);
  });
}
