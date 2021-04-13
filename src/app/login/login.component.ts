import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { interval, Observable } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, tap } from 'rxjs/operators';
import { isEqual } from 'lodash';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  location$ = new Observable((obser) => {
    obser.next(4);
  }).pipe(
    delay(2000),
    tap((resp) => console.log('callend tap', resp))
  );
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      location: [],
      search: 'abcdddd',
    });

    this.form.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(isEqual))
      .subscribe((resp) => {
        console.log('backend called', resp);
      });
  }

  ngOnInit(): void {}
}
