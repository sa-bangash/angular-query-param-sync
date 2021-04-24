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

  ngOnInit(): void {}
}
