import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { merge } from 'lodash';
import { Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  search = new FormControl();
  location = new FormControl([]);
  location$ = new Observable((obser) => {
    obser.next([4]);
  }).pipe(delay(2000));
  constructor() {}

  ngOnInit(): void {
    merge(this.location.valueChanges, this.search.valueChanges)
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((resp) => {});
  }
  toIntArray(val: any[]) {
    if (Array.isArray(val)) {
      return val.map((item) => +item);
    }
    if (val) {
      return [+val];
    }
    return [];
  }
}
