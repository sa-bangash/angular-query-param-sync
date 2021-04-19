import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { FilterParamSync } from './filter-param-sync.directive';
import { FilterParamStorage } from './filter-param-storage.directive';
import { BooksComponent } from './books/books.component';
import { FilterGroupParamSyncDirective } from './filter-group-param-sync.directive';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    FilterParamSync,
    FilterParamStorage,
    BooksComponent,
    FilterGroupParamSyncDirective,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
