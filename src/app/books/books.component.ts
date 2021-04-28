import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
import { ParamSyncFactory } from '../param-sync/param-sync-factory';
import { ParamSyncController } from '../param-sync/param-sync.controller';
import { CONTROL_TYPES } from '../param-sync/utils';

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
  queryParamFilter: ParamSyncController;
  constructor(
    private fb: FormBuilder,
    public queryParamSyncFactory: ParamSyncFactory
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
