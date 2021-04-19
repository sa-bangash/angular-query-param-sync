import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { BooksComponent } from './books/books.component';
import { QueryParamSyncModule } from './query-param-sync/query-param-sync.module';

@NgModule({
  declarations: [AppComponent, LoginComponent, SignupComponent, BooksComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    QueryParamSyncModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
