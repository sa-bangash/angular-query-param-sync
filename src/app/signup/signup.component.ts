import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  search = new FormControl();
  location = new FormControl();
  location$ = new Observable((obser) => {
    obser.next(4);
  }).pipe(delay(2000));
  constructor() {}

  ngOnInit(): void {}
}
