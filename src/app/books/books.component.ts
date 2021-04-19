import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isEqual } from 'lodash';
import { Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged } from 'rxjs/operators';
import { FilterStoreService } from '../filter-store.service';

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
  constructor(
    private fb: FormBuilder,
    public filterStoreService: FilterStoreService
  ) {
    this.filterStoreService.setFeatureKey('search');
    this.form = this.fb.group({
      booksName: [[]],
      search: 'default from form',
      date: [],
    });

    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(isEqual))
      .subscribe((resp) => {});
  }

  ngOnInit(): void {}
}
