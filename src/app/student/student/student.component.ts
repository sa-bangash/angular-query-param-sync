import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
import { FilterParamService } from 'src/app/query-param-sync/filter-param.service';
import { FilterStoreService } from 'src/app/query-param-sync/filter-store.service';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
  // providers: [FilterParamService],
})
export class StudentComponent implements OnInit, OnDestroy {
  form: FormGroup;
  location$ = new Observable((obser) => {
    obser.next(4);
  }).pipe(delay(2000));
  constructor(
    private fb: FormBuilder,
    public filterStoreService: FilterStoreService,
    public filterParamService: FilterParamService
  ) {
    this.form = this.fb.group({
      booksName: [[]],
      search: 'default from form',
      date: [],
    });
    this.filterStoreService.setFeatureKey('Students');
    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(isEqual))
      .subscribe((resp) => {
        console.log('book backend called', this.form.value);
      });
    this.filterParamService.init(this.form, {
      queryParamName: 'student',
      storage: this.filterStoreService,
    });
  }
  ngOnDestroy(): void {
    console.log('destory caled');
    this.filterParamService.destory();
  }

  ngOnInit(): void {}
}
