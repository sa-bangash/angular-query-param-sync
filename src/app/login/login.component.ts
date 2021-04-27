import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { interval, Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';
import { FilterStoreService } from '../query-param-sync/filter-store.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  location$ = new Observable((obser) => {
    obser.next(4);
  }).pipe(delay(2000));
  constructor(
    private fb: FormBuilder,
    public filterStoreService: FilterStoreService
  ) {
    this.filterStoreService.setFeatureKey('search');
    this.form = this.fb.group({
      location: [],
      search: 'default from form',
    });

    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(isEqual))
      .subscribe((resp) => {});
  }

  ngOnInit(): void {}
}
